import Fastify, { type FastifyInstance, type FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { type AppRole, requireAuth, requireRole, signToken } from "./lib/auth.js";
import { pinBuffer } from "./lib/ipfs.js";
import { personalizeQuestions } from "./lib/personalize.js";
import { scoreAttempt } from "./lib/scoring.js";
import { extractQuestionsFromText } from "./lib/ai-extract.js";
import {
  anchorScoreOnChain,
  computeContentHash,
  computeExamKey,
  computeMetadataHash,
  computeScoreHash,
  computeStudentCommitment,
  getRelayerAddress,
  publishExamOnChain,
  registerExamOnChain,
} from "./lib/chain.js";

const UNI_SALT = () => process.env.UNIVERSITY_SALT ?? "dev-salt";
const PERS_SECRET = () => process.env.PERSONALIZATION_SECRET ?? "dev-personalization";

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });
  await app.register(cookie, { secret: process.env.COOKIE_SECRET ?? "cookie-secret-change" });
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  const setSession = (reply: FastifyReply, token: string) => {
    reply.setCookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
    });
  };

  app.get("/health", async () => ({ ok: true }));

  app.post("/v1/auth/register", async (req, reply) => {
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(["STUDENT", "LECTURER"]),
      studentId: z.string().optional(),
    });
    const body = schema.parse(req.body);
    if (body.role === "STUDENT" && !body.studentId) {
      return reply.code(400).send({ error: "studentId required for students" });
    }
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.code(409).send({ error: "Email already registered" });
    const user = await prisma.user.create({
      data: {
        email: body.email,
        role: body.role,
        studentId: body.studentId ?? null,
      },
    });
    const token = signToken({ sub: user.id, role: user.role as AppRole });
    setSession(reply, token);
    return { user: { id: user.id, email: user.email, role: user.role, studentId: user.studentId } };
  });

  app.post("/v1/auth/login", async (req, reply) => {
    const schema = z.object({ email: z.string().email(), studentId: z.string().optional() });
    const body = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return reply.code(401).send({ error: "Invalid credentials" });
    if (user.role === "STUDENT") {
      if (!body.studentId || body.studentId !== user.studentId) {
        return reply.code(401).send({ error: "Invalid student ID for this email" });
      }
    }
    const token = signToken({ sub: user.id, role: user.role as AppRole });
    setSession(reply, token);
    return { user: { id: user.id, email: user.email, role: user.role, studentId: user.studentId } };
  });

  app.post("/v1/auth/logout", async (_req, reply) => {
    reply.clearCookie("token", { path: "/" });
    return { ok: true };
  });

  app.get("/v1/me", async (req, reply) => {
    const p = await requireAuth(req, reply);
    const user = await prisma.user.findUnique({ where: { id: p.sub } });
    if (!user) return reply.code(404).send({ error: "Not found" });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      smartAccountAddress: user.smartAccountAddress,
    };
  });

  app.post("/v1/me/wallet", async (req, reply) => {
    const p = await requireAuth(req, reply);
    const schema = z.object({ smartAccountAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) });
    const body = schema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: p.sub },
      data: { smartAccountAddress: body.smartAccountAddress },
    });
    return { smartAccountAddress: user.smartAccountAddress };
  });

  app.post("/v1/student/enroll", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const schema = z.object({ joinCode: z.string().min(4) });
    const { joinCode } = schema.parse(req.body);
    const course = await prisma.course.findFirst({ where: { joinCode } });
    if (!course) return reply.code(404).send({ error: "Invalid join code" });
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: p.sub, courseId: course.id } },
      create: { userId: p.sub, courseId: course.id, status: "ACTIVE" },
      update: { status: "ACTIVE" },
    });
    return { courseId: course.id };
  });

  app.get("/v1/student/courses", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const rows = await prisma.enrollment.findMany({
      where: { userId: p.sub, status: "ACTIVE" },
      include: { course: { include: { exams: { where: { status: "PUBLISHED" } } } } },
    });
    return {
      courses: rows.map((r) => ({
        id: r.course.id,
        title: r.course.title,
        code: r.course.code,
        level: r.course.level,
        term: r.course.term,
        exams: r.course.exams.map((e) => ({
          id: e.id,
          title: e.title,
          opensAt: e.opensAt,
          closesAt: e.closesAt,
          durationMinutes: e.durationMinutes,
        })),
      })),
    };
  });

  app.get("/v1/student/courses/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const id = Number((req.params as { id: string }).id);
    const enr = await prisma.enrollment.findFirst({
      where: { userId: p.sub, courseId: id, status: "ACTIVE" },
    });
    if (!enr) return reply.code(403).send({ error: "Not enrolled" });
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        materials: true,
        exams: { where: { status: "PUBLISHED" }, orderBy: { opensAt: "asc" } },
      },
    });
    if (!course) return reply.code(404).send({ error: "Not found" });
    return { course };
  });

  app.get("/v1/student/exams/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const examId = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: true },
    });
    if (!exam || exam.status !== "PUBLISHED") return reply.code(404).send({ error: "Exam not found" });
    const enr = await prisma.enrollment.findFirst({
      where: { userId: p.sub, courseId: exam.courseId, status: "ACTIVE" },
    });
    if (!enr) return reply.code(403).send({ error: "Not enrolled" });
    const now = Date.now();
    const eligible =
      now >= exam.opensAt.getTime() &&
      now <= exam.closesAt.getTime();
    return {
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      opensAt: exam.opensAt,
      closesAt: exam.closesAt,
      eligible,
      started: !!(await prisma.attempt.findUnique({
        where: { examId_userId: { examId: exam.id, userId: p.sub } },
      })),
    };
  });

  app.post("/v1/student/exams/:id/attempts", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const examId = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!exam || exam.status !== "PUBLISHED") return reply.code(404).send({ error: "Exam not found" });
    const enr = await prisma.enrollment.findFirst({
      where: { userId: p.sub, courseId: exam.courseId, status: "ACTIVE" },
    });
    if (!enr) return reply.code(403).send({ error: "Not enrolled" });
    const now = Date.now();
    if (now < exam.opensAt.getTime() || now > exam.closesAt.getTime()) {
      return reply.code(400).send({ error: "Exam not available in this window" });
    }

    let attempt = await prisma.attempt.findUnique({
      where: { examId_userId: { examId, userId: p.sub } },
    });
    if (attempt?.submittedAt) return reply.code(400).send({ error: "Already submitted" });

    if (!attempt) {
      const qrows = exam.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      }));
      const pers = personalizeQuestions(qrows, exam.id, p.sub, PERS_SECRET());
      attempt = await prisma.attempt.create({
        data: {
          examId,
          userId: p.sub,
          personalized: JSON.stringify({ questions: pers.questions, grading: pers.grading }),
          answers: JSON.stringify({}),
        },
      });
    }

    const data = JSON.parse(attempt.personalized!) as { questions: unknown[]; grading: Record<string, number> };
    return { attemptId: attempt.id, questions: data.questions, durationMinutes: exam.durationMinutes };
  });

  app.patch("/v1/student/attempts/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const attemptId = Number((req.params as { id: string }).id);
    const schema = z.object({ answers: z.record(z.union([z.number(), z.string()])) });
    const body = schema.parse(req.body);
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== p.sub) return reply.code(404).send({ error: "Not found" });
    if (attempt.submittedAt) return reply.code(400).send({ error: "Already submitted" });
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { answers: JSON.stringify(body.answers) },
    });
    return { ok: true };
  });

  app.post("/v1/student/attempts/:id/submit", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const attemptId = Number((req.params as { id: string }).id);
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { exam: { include: { questions: true } } },
    });
    if (!attempt || attempt.userId !== p.sub) return reply.code(404).send({ error: "Not found" });
    if (attempt.submittedAt) return reply.code(400).send({ error: "Already submitted" });

    const pers = JSON.parse(attempt.personalized!) as { grading: Record<string, number> };
    const answers = attempt.answers ? (JSON.parse(attempt.answers) as Record<string, number | string>) : {};
    const { score, max } = scoreAttempt(attempt.exam.questions, answers, pers.grading ?? {});
    const scorePercent = max > 0 ? Math.round((score / max) * 100) : 0;
    const scoreHash = computeScoreHash(attemptId, scorePercent, 1n);
    const metadataHash = computeMetadataHash({ attemptId, examId: attempt.examId });

    const user = await prisma.user.findUnique({ where: { id: p.sub } });
    if (!user?.studentId) return reply.code(400).send({ error: "Student ID missing" });

    let anchorTxHash: string | null = null;
    let anchorStatus: "PENDING" | "CONFIRMED" | "FAILED" = "CONFIRMED";

    const exam = attempt.exam;
    const examKey =
      exam.examKey ??
      (() => {
        const rel = getRelayerAddress();
        return rel ? computeExamKey(rel, exam.id) : null;
      })();

    if (examKey && process.env.SCORE_ANCHOR_ADDRESS && process.env.RELAYER_PRIVATE_KEY) {
      try {
        anchorStatus = "PENDING";
        const txh = await anchorScoreOnChain({
          examKey,
          studentCommitment: computeStudentCommitment(UNI_SALT(), user.studentId),
          scoreHash,
          metadataHash,
        });
        anchorTxHash = txh;
        anchorStatus = "CONFIRMED";
      } catch (e) {
        app.log.error(e);
        anchorStatus = "FAILED";
      }
    }

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        answers: JSON.stringify(answers),
        score,
        scoreHash,
        metadataHash,
        anchorTxHash,
        anchorStatus,
      },
    });

    return { score, max, scorePercent, anchorTxHash, anchorStatus };
  });

  app.get("/v1/student/attempts/:id/result", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const attemptId = Number((req.params as { id: string }).id);
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { exam: { include: { course: true } } },
    });
    if (!attempt || attempt.userId !== p.sub) return reply.code(404).send({ error: "Not found" });
    if (!attempt.submittedAt) return reply.code(400).send({ error: "Not submitted yet" });
    return {
      score: attempt.score,
      scoreHash: attempt.scoreHash,
      anchorTxHash: attempt.anchorTxHash,
      anchorStatus: attempt.anchorStatus,
      exam: { id: attempt.exam.id, title: attempt.exam.title },
      course: attempt.exam.course,
    };
  });

  app.get("/v1/student/records", async (req, reply) => {
    const p = await requireRole(req, reply, "STUDENT");
    const attempts = await prisma.attempt.findMany({
      where: { userId: p.sub, submittedAt: { not: null } },
      include: { exam: { include: { course: true } } },
      orderBy: { submittedAt: "desc" },
    });
    return {
      records: attempts.map((a) => ({
        attemptId: a.id,
        score: a.score,
        submittedAt: a.submittedAt,
        anchorStatus: a.anchorStatus,
        anchorTxHash: a.anchorTxHash,
        examTitle: a.exam.title,
        courseCode: a.exam.course.code,
      })),
    };
  });

  app.get("/v1/lecturer/courses/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const course = await prisma.course.findFirst({
      where: { id, lecturerId: p.sub },
      include: { exams: true, materials: true, enrollments: true },
    });
    if (!course) return reply.code(404).send({ error: "Not found" });
    return { course };
  });

  app.get("/v1/lecturer/courses", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const courses = await prisma.course.findMany({
      where: { lecturerId: p.sub },
      include: { _count: { select: { exams: true, enrollments: true } } },
    });
    return { courses };
  });

  app.post("/v1/lecturer/courses", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const schema = z.object({
      title: z.string(),
      code: z.string(),
      level: z.string(),
      term: z.string(),
      joinCode: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const course = await prisma.course.create({
      data: { ...body, lecturerId: p.sub, joinCode: body.joinCode ?? Math.random().toString(36).slice(2, 10) },
    });
    return { course };
  });

  app.patch("/v1/lecturer/courses/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const schema = z.object({
      title: z.string().optional(),
      code: z.string().optional(),
      level: z.string().optional(),
      term: z.string().optional(),
      joinCode: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const course = await prisma.course.findFirst({ where: { id, lecturerId: p.sub } });
    if (!course) return reply.code(404).send({ error: "Not found" });
    const updated = await prisma.course.update({ where: { id }, data: body });
    return { course: updated };
  });

  app.post("/v1/lecturer/courses/:id/roster", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const courseId = Number((req.params as { id: string }).id);
    const course = await prisma.course.findFirst({ where: { id: courseId, lecturerId: p.sub } });
    if (!course) return reply.code(404).send({ error: "Not found" });
    const schema = z.object({
      rows: z.array(z.object({ studentId: z.string(), email: z.string().email() })),
    });
    const { rows } = schema.parse(req.body);
    for (const row of rows) {
      const user =
        (await prisma.user.findFirst({ where: { email: row.email } })) ??
        (await prisma.user.create({
          data: { email: row.email, studentId: row.studentId, role: "STUDENT" },
        }));
      if (user.studentId !== row.studentId) {
        await prisma.user.update({ where: { id: user.id }, data: { studentId: row.studentId } });
      }
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId } },
        create: { userId: user.id, courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
    }
    return { imported: rows.length };
  });

  app.post("/v1/lecturer/courses/:id/materials", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const courseId = Number((req.params as { id: string }).id);
    const course = await prisma.course.findFirst({ where: { id: courseId, lecturerId: p.sub } });
    if (!course) return reply.code(404).send({ error: "Not found" });
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: "file required" });
    const buf = await file.toBuffer();
    const { cid, hint } = pinBuffer(buf, file.filename);
    const textHint = buf.toString("utf8").slice(0, 8000);
    const mat = await prisma.material.create({
      data: { courseId, name: file.filename, cid, textHint },
    });
    return { material: mat };
  });

  app.post("/v1/lecturer/courses/:id/exams", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const courseId = Number((req.params as { id: string }).id);
    const course = await prisma.course.findFirst({ where: { id: courseId, lecturerId: p.sub } });
    if (!course) return reply.code(404).send({ error: "Not found" });
    const schema = z.object({
      title: z.string(),
      opensAt: z.string().datetime(),
      closesAt: z.string().datetime(),
      durationMinutes: z.number().min(1),
      questionSource: z.enum(["AI_MATERIALS", "FILE_UPLOAD"]),
    });
    const body = schema.parse(req.body);
    const exam = await prisma.exam.create({
      data: {
        courseId,
        title: body.title,
        opensAt: new Date(body.opensAt),
        closesAt: new Date(body.closesAt),
        durationMinutes: body.durationMinutes,
        questionSource: body.questionSource,
        status: "DRAFT",
      },
    });
    return { exam };
  });

  app.get("/v1/lecturer/exams/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    return { exam };
  });

  app.patch("/v1/lecturer/exams/:id", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    const schema = z.object({
      title: z.string().optional(),
      opensAt: z.string().datetime().optional(),
      closesAt: z.string().datetime().optional(),
      durationMinutes: z.number().optional(),
      questionSource: z.enum(["AI_MATERIALS", "FILE_UPLOAD"]).optional(),
    });
    const body = schema.parse(req.body);
    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...body,
        opensAt: body.opensAt ? new Date(body.opensAt) : undefined,
        closesAt: body.closesAt ? new Date(body.closesAt) : undefined,
      },
    });
    return { exam: updated };
  });

  app.post("/v1/lecturer/exams/:id/extract", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
      include: { course: { include: { materials: true } } },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    const bodyParse = z.object({ sourceText: z.string().optional() }).safeParse(req.body ?? {});
    const pasted = bodyParse.success ? (bodyParse.data.sourceText ?? "").trim() : "";
    const materialText = exam.course.materials.map((m) => m.textHint ?? "").join("\n\n");
    const text = [materialText, pasted].filter((s) => s.length > 0).join("\n\n---\n\n");
    const drafts = await extractQuestionsFromText(text || pasted || materialText);
    await prisma.question.deleteMany({ where: { examId: id } });
    let order = 0;
    for (const d of drafts) {
      await prisma.question.create({
        data: {
          examId: id,
          type: d.type === "MCQ" ? "MCQ" : "SHORT_ANSWER",
          prompt: d.prompt,
          options: d.options ? JSON.stringify(d.options) : null,
          correctIndex: d.correctIndex ?? null,
          points: d.points,
          order: order++,
        },
      });
    }
    return { count: drafts.length };
  });

  app.post("/v1/lecturer/exams/:id/questions-file", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    const schema = z.object({
      questions: z.array(
        z.object({
          type: z.enum(["MCQ", "SHORT_ANSWER"]),
          prompt: z.string(),
          options: z.array(z.string()).optional(),
          correctIndex: z.number().optional(),
          points: z.number().default(1),
        })
      ),
    });
    const body = schema.parse(req.body);
    await prisma.question.deleteMany({ where: { examId: id } });
    let order = 0;
    for (const d of body.questions) {
      await prisma.question.create({
        data: {
          examId: id,
          type: d.type === "MCQ" ? "MCQ" : "SHORT_ANSWER",
          prompt: d.prompt,
          options: d.options ? JSON.stringify(d.options) : null,
          correctIndex: d.correctIndex ?? null,
          points: d.points,
          order: order++,
        },
      });
    }
    await prisma.exam.update({
      where: { id },
      data: { questionSource: "FILE_UPLOAD" },
    });
    return { count: body.questions.length };
  });

  app.patch("/v1/lecturer/exams/:id/questions", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    const schema = z.object({
      questions: z.array(
        z.object({
          id: z.number().optional(),
          type: z.enum(["MCQ", "SHORT_ANSWER"]),
          prompt: z.string(),
          options: z.array(z.string()).optional(),
          correctIndex: z.number().optional(),
          points: z.number().default(1),
        })
      ),
    });
    const body = schema.parse(req.body);
    await prisma.question.deleteMany({ where: { examId: id } });
    let order = 0;
    for (const d of body.questions) {
      await prisma.question.create({
        data: {
          examId: id,
          type: d.type === "MCQ" ? "MCQ" : "SHORT_ANSWER",
          prompt: d.prompt,
          options: d.options ? JSON.stringify(d.options) : null,
          correctIndex: d.correctIndex ?? null,
          points: d.points,
          order: order++,
        },
      });
    }
    return { count: body.questions.length };
  });

  app.post("/v1/lecturer/exams/:id/publish", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
      include: { questions: true, course: true },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    if (exam.questions.length === 0) return reply.code(400).send({ error: "Add questions first" });
    const relayer = getRelayerAddress();
    const examKey = relayer ? computeExamKey(relayer, exam.id) : null;
    const qids = exam.questions.map((q) => q.id);
    const contentHash = computeContentHash(exam.id, qids);

    let registryTx: string | null = null;
    if (examKey && relayer) {
      const lecturer = await prisma.user.findUnique({ where: { id: p.sub } });
      const lectAddr = lecturer?.smartAccountAddress ?? "0x0000000000000000000000000000000000000000";
      registryTx = await registerExamOnChain({
        examKey,
        contentHash,
        opensAt: Math.floor(exam.opensAt.getTime() / 1000),
        closesAt: Math.floor(exam.closesAt.getTime() / 1000),
        lecturer: lectAddr,
      });
      if (registryTx) {
        await publishExamOnChain(examKey, true);
      }
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        contentHash,
        ...(examKey ? { examKey } : {}),
      },
    });
    return { exam: updated, registryTx };
  });

  app.get("/v1/lecturer/exams/:id/monitor", async (req, reply) => {
    const p = await requireRole(req, reply, "LECTURER");
    const id = Number((req.params as { id: string }).id);
    const exam = await prisma.exam.findFirst({
      where: { id, course: { lecturerId: p.sub } },
      include: { attempts: true },
    });
    if (!exam) return reply.code(404).send({ error: "Not found" });
    const submitted = exam.attempts.filter((a) => a.submittedAt).length;
    return {
      totalAttempts: exam.attempts.length,
      submitted,
      attempts: exam.attempts.map((a) => ({
        id: a.id,
        userId: a.userId,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        score: a.score,
      })),
    };
  });

  return app;
}
