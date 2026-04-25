"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function ExamLivePage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [data, setData] = useState<{
    totalAttempts: number;
    submitted: number;
    attempts: { id: number; userId: string }[];
  } | null>(null);

  useEffect(() => {
    void api<{
      email: string;
      smartAccountAddress: string | null;
      role: string;
    }>("/v1/me")
      .then((m) => {
        if (m.role !== "LECTURER") {
          router.push("/");
          return;
        }
        setMe(m);
      })
      .catch(() => router.push("/lecturer/login"));
  }, [router]);

  useEffect(() => {
    void api<typeof data>(`/v1/lecturer/exams/${examId}/monitor`).then(setData);
  }, [examId]);

  if (!me || !data) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold">Exam monitor</h1>
        <p className="mt-2 text-sm text-slate-600">
          Attempts started: {data.totalAttempts} · Submitted: {data.submitted}
        </p>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Attempt</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {data.attempts.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="py-2">{a.id}</td>
                <td className="font-mono text-xs">{a.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link
          href="/lecturer/courses"
          className="mt-8 inline-block text-sm underline"
        >
          Courses
        </Link>
      </div>
    </AppShell>
  );
}
