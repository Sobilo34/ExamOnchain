"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { buildExplorerTxUrl, networkConfig } from "@/lib/brand";

export default function StudentRecordsPage() {
  const router = useRouter();
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [records, setRecords] = useState<
    {
      attemptId: number;
      score: number | null;
      submittedAt: string | null;
      anchorStatus: string;
      anchorTxHash: string | null;
      examTitle: string;
      courseCode: string;
    }[]
  >([]);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me")
      .then(setMe)
      .catch(() => router.push("/student/login"));
  }, [router]);

  useEffect(() => {
    void api<{ records: typeof records }>("/v1/student/records").then((r) =>
      setRecords(r.records),
    );
  }, []);

  if (!me) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <section className="fut-enter rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.09)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Verified transcript
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Academic records
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Scores are anchored on {networkConfig.chainName}; verify each
          transaction through {networkConfig.explorerName}.
        </p>
      </section>

      <ul className="mt-6 grid gap-3 md:hidden">
        {records.map((r) => (
          <li
            key={r.attemptId}
            className="fut-enter fut-enter-delay-1 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm shadow-sm backdrop-blur"
          >
            <p className="font-semibold text-slate-900">{r.examTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{r.courseCode}</p>
            <p className="mt-2 text-slate-700">
              Score: <span className="font-semibold">{r.score ?? "—"}</span>
            </p>
            <p className="mt-1 text-slate-600">Anchor: {r.anchorStatus}</p>
            {r.anchorTxHash && (
              <a
                className="mt-3 inline-block text-sky-700 underline"
                href={buildExplorerTxUrl(r.anchorTxHash)}
                target="_blank"
                rel="noreferrer"
              >
                View tx
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 pl-4">Course</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Anchor</th>
              <th className="pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.attemptId} className="border-b border-slate-100">
                <td className="py-3 pl-4">{r.courseCode}</td>
                <td>{r.examTitle}</td>
                <td>{r.score ?? "—"}</td>
                <td>{r.anchorStatus}</td>
                <td className="pr-4">
                  {r.anchorTxHash && (
                    <a
                      className="text-sky-700 underline"
                      href={buildExplorerTxUrl(r.anchorTxHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tx
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <p className="mt-6 text-slate-600">No submitted attempts yet.</p>
      )}
    </AppShell>
  );
}
