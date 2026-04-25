"use client";

import { useCallback, useEffect, useState } from "react";
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

type EditableQ = {
  key: string;
  type: "MCQ" | "SHORT_ANSWER";
  prompt: string;
  optionsText: string;
  correctIndex: number;
  points: number;
};

function fromServerQuestions(qs: Q[]): EditableQ[] {
  return qs.map((q) => ({
    key: `server-${q.id}`,
    type: q.type === "MCQ" ? "MCQ" : "SHORT_ANSWER",
    prompt: q.prompt,
    optionsText: q.options
      ? (() => {
          try {
            const arr = JSON.parse(q.options) as string[];
            return Array.isArray(arr) ? arr.join("\n") : "";
          } catch {
            return "";
          }
        })()
      : "",
    correctIndex: q.correctIndex ?? 0,
    points: q.points,
  }));
}

function toPayload(rows: EditableQ[]) {
  return rows.map((r) => {
    if (r.type === "MCQ") {
      const options = r.optionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        type: "MCQ" as const,
        prompt: r.prompt.trim(),
        options,
        correctIndex: Math.min(Math.max(0, r.correctIndex), Math.max(0, options.length - 1)),
        points: r.points,
      };
    }
    return {
      type: "SHORT_ANSWER" as const,
      prompt: r.prompt.trim(),
      points: r.points,
    };
  });
}

export default function ExamDraftPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);
  const [rows, setRows] = useState<EditableQ[]>([]);
  const [sourceText, setSourceText] = useState("");
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api<{ exam: { questions: Q[] } }>(`/v1/lecturer/exams/${examId}`);
      setRows(fromServerQuestions(r.exam.questions));
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const t = typeof reader.result === "string" ? reader.result : "";
      setSourceText((prev) => (prev ? `${prev}\n\n${t}` : t));
    };
    reader.onerror = () => setErr("Could not read file");
    reader.readAsText(f);
    e.target.value = "";
  };

  const runExtract = async () => {
    setExtracting(true);
    setErr(null);
    try {
      await api(`/v1/lecturer/exams/${examId}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText: sourceText.trim() || undefined }),
      });
      await load();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Extract failed");
    } finally {
      setExtracting(false);
    }
  };

  const saveQuestions = async () => {
    const payload = toPayload(rows);
    for (const p of payload) {
      if (!p.prompt) {
        setErr("Each question needs a prompt.");
        return;
      }
      if (p.type === "MCQ" && (!p.options || p.options.length < 2)) {
        setErr("MCQ questions need at least two options (one per line).");
        return;
      }
    }
    setSaving(true);
    setErr(null);
    try {
      await api(`/v1/lecturer/exams/${examId}/questions`, {
        method: "PATCH",
        body: JSON.stringify({ questions: payload }),
      });
      await load();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setErr(null);
    try {
      await api(`/v1/lecturer/exams/${examId}/publish`, { method: "POST" });
      router.push(`/lecturer/exams/${examId}/live`);
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Publish failed");
    }
  };

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        key: crypto.randomUUID(),
        type: "MCQ",
        prompt: "",
        optionsText: "Option A\nOption B\nOption C",
        correctIndex: 0,
        points: 1,
      },
    ]);
  };

  const removeRow = (key: string) => setRows((r) => r.filter((x) => x.key !== key));

  const updateRow = (key: string, patch: Partial<EditableQ>) => {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-12 text-slate-600">Loading draft…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-xl font-semibold text-slate-900">Exam draft #{examId}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Paste a quiz or notes below and/or rely on course materials, then run AI extract. OpenRouter reads the combined text
        and fills questions — no JSON required. Copy the same <code className="rounded bg-slate-100 px-1 text-xs">OPENROUTER_API_KEY</code>{" "}
        from chain-guard into <code className="rounded bg-slate-100 px-1 text-xs">apps/api/.env</code>.
      </p>

      {err && <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>}

      <section className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">Source text (paste or file)</h2>
        <p className="text-xs text-slate-500">
          Plain text only for upload (.txt / .md). This is merged with any course materials when you run extract.
        </p>
        <textarea
          className="min-h-[160px] w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Paste exam questions, learning objectives, or raw notes here…"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm hover:bg-slate-100">
            Upload text file
            <input type="file" accept=".txt,.md,.text,.csv,.log" className="hidden" onChange={onPickFile} />
          </label>
          <button
            type="button"
            disabled={extracting}
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            onClick={() => void runExtract()}
          >
            {extracting ? "Running AI…" : "Run AI extract"}
          </button>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          onClick={() => void saveQuestions()}
        >
          {saving ? "Saving…" : "Save questions"}
        </button>
        <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={addRow}>
          Add question
        </button>
        <button type="button" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white" onClick={() => void publish()}>
          Publish
        </button>
      </div>

      <ul className="mt-8 space-y-6">
        {rows.length === 0 && <li className="text-sm text-slate-500">No questions yet — paste text and run AI extract, or add manually.</li>}
        {rows.map((row, idx) => (
          <li key={row.key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Question {idx + 1}</span>
              <button type="button" className="text-xs text-red-600 underline" onClick={() => removeRow(row.key)}>
                Remove
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-600">
                Type
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                  value={row.type}
                  onChange={(e) => updateRow(row.key, { type: e.target.value as "MCQ" | "SHORT_ANSWER" })}
                >
                  <option value="MCQ">Multiple choice</option>
                  <option value="SHORT_ANSWER">Short answer</option>
                </select>
              </label>
              <label className="text-xs text-slate-600">
                Points
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                  value={row.points}
                  onChange={(e) => updateRow(row.key, { points: Number(e.target.value) || 1 })}
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-slate-600">
              Prompt
              <textarea
                className="mt-1 min-h-[72px] w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                value={row.prompt}
                onChange={(e) => updateRow(row.key, { prompt: e.target.value })}
              />
            </label>
            {row.type === "MCQ" && (
              <>
                <label className="mt-3 block text-xs text-slate-600">
                  Options (one per line)
                  <textarea
                    className="mt-1 min-h-[96px] w-full rounded border border-slate-300 px-2 py-1.5 font-mono text-sm"
                    value={row.optionsText}
                    onChange={(e) => updateRow(row.key, { optionsText: e.target.value })}
                  />
                </label>
                <label className="mt-3 block text-xs text-slate-600">
                  Correct option index (0 = first line)
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-32 rounded border border-slate-300 px-2 py-1.5 text-sm"
                    value={row.correctIndex}
                    onChange={(e) => updateRow(row.key, { correctIndex: Number(e.target.value) || 0 })}
                  />
                </label>
              </>
            )}
          </li>
        ))}
      </ul>

      <Link href="/lecturer/courses" className="mt-10 inline-block text-sm text-sky-700 underline">
        ← Courses
      </Link>
    </div>
  );
}
