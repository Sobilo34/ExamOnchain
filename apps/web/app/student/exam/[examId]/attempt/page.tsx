"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

type Q = {
  id: number;
  type: string;
  prompt: string;
  options?: string[];
  points: number;
};

export default function ExamAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me")
      .then(setMe)
      .catch(() => router.push("/student/login"));
  }, [router]);

  const start = useCallback(async () => {
    const r = await api<{ attemptId: number; questions: Q[]; durationMinutes: number }>(
      `/v1/student/exams/${examId}/attempts`,
      { method: "POST" }
    );
    setAttemptId(r.attemptId);
    setQuestions(r.questions);
    setDurationMinutes(r.durationMinutes);
    setEndsAt(Date.now() + r.durationMinutes * 60_000);
  }, [examId]);

  useEffect(() => {
    void start().catch(() => router.push(`/student/exam/${examId}/instructions`));
  }, [examId, router, start]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const leftSec = useMemo(() => {
    if (!endsAt) return 0;
    return Math.max(0, Math.floor((endsAt - now) / 1000));
  }, [endsAt, now]);

  const persist = async (next: Record<string, number | string>) => {
    if (!attemptId) return;
    setSaving(true);
    try {
      await api(`/v1/student/attempts/${attemptId}`, {
        method: "PATCH",
        body: JSON.stringify({ answers: next }),
      });
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!attemptId) return;
    try {
      await persist(answers);
      await api<{ score: number; max: number; anchorTxHash: string | null; anchorStatus: string }>(
        `/v1/student/attempts/${attemptId}/submit`,
        { method: "POST" }
      );
      router.push(`/student/exam/${examId}/result?attempt=${attemptId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Submit failed");
    }
  };

  if (!me || !attemptId) return <div className="p-8 text-center">Starting exam…</div>;

  const mm = Math.floor(leftSec / 60);
  const ss = leftSec % 60;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-950">
        Time left: {mm}:{ss.toString().padStart(2, "0")}
        {saving && <span className="ml-2 text-slate-600">Saving…</span>}
      </div>
      <ol className="space-y-8">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Question {i + 1} · {q.points} pt(s)
            </p>
            <p className="mt-2 text-slate-900">{q.prompt}</p>
            {q.type === "MCQ" && q.options && (
              <div className="mt-3 space-y-2">
                {q.options.map((opt, j) => (
                  <label key={j} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[String(q.id)] === j}
                      onChange={() => {
                        const next = { ...answers, [String(q.id)]: j };
                        setAnswers(next);
                        void persist(next);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {q.type === "SHORT_ANSWER" && (
              <textarea
                className="mt-3 w-full rounded border border-slate-300 p-2 text-sm"
                rows={3}
                value={(answers[String(q.id)] as string) ?? ""}
                onChange={(e) => {
                  const next = { ...answers, [String(q.id)]: e.target.value };
                  setAnswers(next);
                  void persist(next);
                }}
              />
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="mt-8 rounded-lg bg-slate-900 px-6 py-2.5 text-sm text-white"
        onClick={() => void submit()}
      >
        Submit exam
      </button>
    </AppShell>
  );
}
