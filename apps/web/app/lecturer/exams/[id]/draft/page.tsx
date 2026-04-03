"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Q = {
  id: number;
  type: string;
  prompt: string;
  options: string | null;
  correctIndex: number | null;
  points: number;
};

export default function ExamDraftPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [json, setJson] = useState("");

  useEffect(() => {
    void api<{ exam: { questions: Q[] } }>(`/v1/lecturer/exams/${examId}`).then((r) => {
      setQuestions(r.exam.questions);
      setJson(
        JSON.stringify(
          r.exam.questions.map((q) => ({
            type: q.type,
            prompt: q.prompt,
            options: q.options ? JSON.parse(q.options) : undefined,
            correctIndex: q.correctIndex ?? undefined,
            points: q.points,
          })),
          null,
          2
        )
      );
    });
  }, [examId]);

  const extract = async () => {
    await api(`/v1/lecturer/exams/${examId}/extract`, { method: "POST" });
    const r = await api<{ exam: { questions: Q[] } }>(`/v1/lecturer/exams/${examId}`);
    setQuestions(r.exam.questions);
  };

  const saveJson = async () => {
    const parsed = JSON.parse(json) as {
      type: "MCQ" | "SHORT_ANSWER";
      prompt: string;
      options?: string[];
      correctIndex?: number;
      points: number;
    }[];
    await api(`/v1/lecturer/exams/${examId}/questions`, {
      method: "PATCH",
      body: JSON.stringify({ questions: parsed }),
    });
    const r = await api<{ exam: { questions: Q[] } }>(`/v1/lecturer/exams/${examId}`);
    setQuestions(r.exam.questions);
  };

  const publish = async () => {
    await api(`/v1/lecturer/exams/${examId}/publish`, { method: "POST" });
    router.push(`/lecturer/exams/${examId}/live`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-xl font-semibold">Exam draft #{examId}</h1>
      <div className="mt-4 flex gap-3">
        <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => void extract()}>
          Run AI extract
        </button>
        <button type="button" className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white" onClick={() => void saveJson()}>
          Save questions JSON
        </button>
        <button type="button" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white" onClick={() => void publish()}>
          Publish
        </button>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Edit the JSON below (MCQ needs options + correctIndex). Or use “Run AI extract” after uploading materials.
      </p>
      <textarea className="mt-2 w-full rounded border font-mono text-xs" rows={18} value={json} onChange={(e) => setJson(e.target.value)} />
      <ul className="mt-6 space-y-2 text-sm">
        {questions.map((q) => (
          <li key={q.id} className="rounded border border-slate-100 bg-white p-2">
            <strong>{q.type}</strong>: {q.prompt.slice(0, 120)}…
          </li>
        ))}
      </ul>
      <Link href="/lecturer/courses" className="mt-6 inline-block text-sm underline">
        Courses
      </Link>
    </div>
  );
}
