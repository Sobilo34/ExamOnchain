"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function RosterPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const [raw, setRaw] = useState("studentId,email\n2024001,alice@uni.edu\n");
  const [msg, setMsg] = useState<string | null>(null);

  const importCsv = async () => {
    const lines = raw.trim().split("\n").slice(1);
    const rows = lines
      .map((line) => line.split(",").map((s) => s.trim()))
      .filter((p) => p.length >= 2)
      .map(([studentId, email]) => ({ studentId, email }));
    await api(`/v1/lecturer/courses/${courseId}/roster`, { method: "POST", body: JSON.stringify({ rows }) });
    setMsg(`Imported ${rows.length} rows`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-xl font-semibold">Roster import</h1>
      <p className="mt-2 text-sm text-slate-600">CSV: studentId,email (header row optional)</p>
      <textarea className="mt-4 w-full rounded border p-3 font-mono text-sm" rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} />
      <button type="button" className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => void importCsv()}>
        Import
      </button>
      {msg && <p className="mt-2 text-sm text-green-700">{msg}</p>}
      <Link href={`/lecturer/courses/${courseId}/edit`} className="mt-6 block text-sm text-slate-600 underline">
        Back to course
      </Link>
    </div>
  );
}
