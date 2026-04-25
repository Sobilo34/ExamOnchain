"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { buildExplorerTxUrl, networkConfig } from "@/lib/brand";

export default function ExamResultPage() {
  const search = useSearchParams();
  const attemptId = Number(search.get("attempt"));
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [result, setResult] = useState<{
    score: number | null;
    anchorTxHash: string | null;
    anchorStatus: string;
    exam: { id: number; title: string };
  } | null>(null);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>(
      "/v1/me",
    ).then(setMe);
  }, []);

  useEffect(() => {
    if (!attemptId) return;
    void api<typeof result>(`/v1/student/attempts/${attemptId}/result`).then(
      setResult,
    );
  }, [attemptId]);

  if (!me || !result) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <section className="fut-enter relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.09)] backdrop-blur">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Assessment result
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{result.exam.title}</h1>
        <p className="mt-4 text-4xl font-semibold text-slate-900">
          {result.score ?? "—"}
          <span className="ml-2 text-sm font-medium text-slate-500">score</span>
        </p>
      </section>
      <div className="fut-enter fut-enter-delay-1 mt-6 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm shadow-sm backdrop-blur">
        <p className="font-medium text-slate-700">On-chain anchor</p>
        <p className="mt-1 text-slate-600">Status: {result.anchorStatus}</p>
        {result.anchorTxHash && (
          <a
            className="mt-2 inline-block text-sky-700 underline"
            href={buildExplorerTxUrl(result.anchorTxHash)}
            target="_blank"
            rel="noreferrer"
          >
            View transaction in {networkConfig.explorerName}
          </a>
        )}
        {!result.anchorTxHash && (
          <p className="mt-2 text-slate-500">
            No tx (configure relayer + ScoreAnchor for {networkConfig.chainName}
            ).
          </p>
        )}
      </div>
      <div className="fut-enter fut-enter-delay-2 mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/student/records"
          className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white"
        >
          All records
        </Link>
        <Link
          href="/student/dashboard"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700"
        >
          Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
