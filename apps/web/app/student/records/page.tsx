"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function StudentRecordsPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
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
    void api<{ records: typeof records }>("/v1/student/records").then((r) => setRecords(r.records));
  }, []);

  if (!me) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold">Academic records</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Course</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Anchor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.attemptId} className="border-b border-slate-100">
              <td className="py-2">{r.courseCode}</td>
              <td>{r.examTitle}</td>
              <td>{r.score ?? "—"}</td>
              <td>{r.anchorStatus}</td>
              <td>
                {r.anchorTxHash && (
                  <a
                    className="text-sky-700 underline"
                    href={`https://sepolia.etherscan.io/tx/${r.anchorTxHash}`}
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
      {records.length === 0 && <p className="mt-6 text-slate-600">No submitted attempts yet.</p>}
    </AppShell>
  );
}
