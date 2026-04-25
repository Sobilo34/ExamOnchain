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
      <div className="fut-enter mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold">Exam monitor</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Attempts started
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {data.totalAttempts}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Submitted
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {data.submitted}
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 md:hidden">
          {data.attempts.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Attempt
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {a.id}
              </p>
              <p className="mt-2 truncate font-mono text-xs text-slate-700">
                {a.userId}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-3 pl-4">Attempt</th>
                <th className="pr-4">User</th>
              </tr>
            </thead>
            <tbody>
              {data.attempts.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-3 pl-4">{a.id}</td>
                  <td className="pr-4 font-mono text-xs">{a.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
