"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function ExamResultPage() {
  const params = useParams();
  const search = useSearchParams();
  const examId = Number(params.examId);
  const attemptId = Number(search.get("attempt"));
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [result, setResult] = useState<{
    score: number | null;
    anchorTxHash: string | null;
    anchorStatus: string;
    exam: { id: number; title: string };
  } | null>(null);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me").then(setMe);
  }, []);

  useEffect(() => {
    if (!attemptId) return;
    void api<typeof result>(`/v1/student/attempts/${attemptId}/result`).then(setResult);
  }, [attemptId]);

  if (!me || !result) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold">Result: {result.exam.title}</h1>
      <p className="mt-4 text-2xl font-semibold text-slate-900">Score: {result.score ?? "—"}</p>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium text-slate-700">On-chain anchor</p>
        <p className="mt-1 text-slate-600">Status: {result.anchorStatus}</p>
        {result.anchorTxHash && (
          <a
            className="mt-2 inline-block text-sky-700 underline"
            href={`https://sepolia.etherscan.io/tx/${result.anchorTxHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View transaction
          </a>
        )}
        {!result.anchorTxHash && <p className="mt-2 text-slate-500">No tx (configure relayer + ScoreAnchor for Sepolia).</p>}
      </div>
      <p className="mt-8">
        <Link href="/student/records" className="text-sky-700 underline">
          All records
        </Link>{" "}
        ·{" "}
        <Link href="/student/dashboard" className="text-slate-600 underline">
          Dashboard
        </Link>
      </p>
    </AppShell>
  );
}
