import { createHash } from "node:crypto";

export type DraftQuestion = {
  type: "MCQ" | "SHORT_ANSWER";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  points: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_SOURCE_CHARS = 14_000;

function stripCodeFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseQuestionsJson(raw: string): { questions?: unknown[] } | null {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned) as { questions?: unknown[] };
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as { questions?: unknown[] };
    } catch {
      return null;
    }
  }
}

function normalizeDraftQuestions(parsed: { questions?: unknown[] } | null): DraftQuestion[] {
  if (!parsed?.questions || !Array.isArray(parsed.questions)) return [];
  const out: DraftQuestion[] = [];
  for (const item of parsed.questions) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const type = q.type === "MCQ" ? "MCQ" : q.type === "SHORT_ANSWER" ? "SHORT_ANSWER" : null;
    if (!type) continue;
    const prompt = typeof q.prompt === "string" ? q.prompt.trim() : "";
    if (!prompt) continue;
    const pointsRaw = typeof q.points === "number" ? q.points : Number(q.points);
    const points = Number.isFinite(pointsRaw) && pointsRaw > 0 ? Math.min(10, Math.floor(pointsRaw)) : 1;
    if (type === "MCQ") {
      let options: string[] = [];
      if (Array.isArray(q.options)) {
        options = q.options.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
      }
      if (options.length < 2) continue;
      let correctIndex = typeof q.correctIndex === "number" ? Math.floor(q.correctIndex) : 0;
      if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
      out.push({ type: "MCQ", prompt, options, correctIndex, points });
    } else {
      out.push({ type: "SHORT_ANSWER", prompt, points });
    }
  }
  return out.slice(0, 20);
}

const SYSTEM_PROMPT = `You are an exam authoring assistant. From SOURCE_TEXT (lecture notes, a pasted quiz, or an unstructured question list), output ONLY a JSON object with this exact top-level shape:
{"questions":[...]}

Each element of "questions" must be either:
- MCQ: {"type":"MCQ","prompt":"string","options":["A","B","C","D"],"correctIndex":0,"points":number}
- Short answer: {"type":"SHORT_ANSWER","prompt":"string","points":number}

Rules:
- correctIndex is 0-based index into options for MCQ.
- Use 3–5 options per MCQ; one clearly best answer.
- points: integer 1–10 per question.
- Produce up to 15 questions grounded in the source when possible; if the source is thin, still output 2–5 reasonable questions.
- No markdown, no commentary outside the JSON object.`;

async function extractWithOpenRouter(text: string): Promise<DraftQuestion[] | null> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key || text.length < 8) return null;

  const model = process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.0-flash-001";
  const referer = process.env.OPENROUTER_HTTP_REFERER?.trim() || "http://localhost:3000";
  const title = process.env.OPENROUTER_APP_TITLE?.trim() || "FUT ExamOnchain";

  const userContent = `SOURCE_TEXT:\n${text.slice(0, MAX_SOURCE_CHARS)}`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": referer,
        "X-Title": title,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[ai-extract] OpenRouter HTTP", res.status, errText.slice(0, 500));
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseQuestionsJson(raw);
    const normalized = normalizeDraftQuestions(parsed);
    return normalized.length > 0 ? normalized : null;
  } catch (e) {
    console.error("[ai-extract] OpenRouter error", e);
    return null;
  }
}

/** Legacy OpenAI path if OPENROUTER_API_KEY is unset. */
async function extractWithOpenAI(text: string): Promise<DraftQuestion[] | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || text.length < 8) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text.slice(0, MAX_SOURCE_CHARS) },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseQuestionsJson(raw);
    const normalized = normalizeDraftQuestions(parsed);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function stubQuestions(text: string): DraftQuestion[] {
  const snippet = text.slice(0, 200).replace(/\s+/g, " ");
  const h = createHash("sha256").update(text).digest("hex").slice(0, 8);
  return [
    {
      type: "MCQ",
      prompt: `Based on the material, what is the main topic discussed? (stub-${h})`,
      options: ["Topic A from notes", "Topic B from notes", "Topic C from notes", "Cannot determine"],
      correctIndex: 0,
      points: 1,
    },
    {
      type: "SHORT_ANSWER",
      prompt: `Summarize one key concept from the handout in one sentence. Ref: ${snippet.slice(0, 80)}…`,
      points: 2,
    },
  ];
}

/**
 * Extract draft questions from freeform text using OpenRouter (same stack as chain-guard: OPENROUTER_API_KEY),
 * else OpenAI if set, else heuristic stubs.
 */
export async function extractQuestionsFromText(text: string): Promise<DraftQuestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < 8) return stubQuestions(trimmed || "empty");

  const viaRouter = await extractWithOpenRouter(trimmed);
  if (viaRouter && viaRouter.length > 0) return viaRouter;

  const viaOpenAI = await extractWithOpenAI(trimmed);
  if (viaOpenAI && viaOpenAI.length > 0) return viaOpenAI;

  return stubQuestions(trimmed);
}
