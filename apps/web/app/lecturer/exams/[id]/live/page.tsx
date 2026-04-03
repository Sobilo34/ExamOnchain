"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function ExamLivePage() {
  const params = useParams();
  const examId = Number(params.id);
  const [data, setData] = useState<{ totalAttempts: number; submitted: number; attempts: { id: number; userId: string }[] } | null>(
    null
  );

  useEffect(() => {
    void api<typeof data>(`/v1/lecturer/exams/${examId}/monitor`).then(setData);
  }, [examId]);

  if (!data) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-xl font-semibold">Exam monitor</h1>
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
      <Link href="/lecturer/courses" className="mt-8 inline-block text-sm underline">
        Courses
      </Link>
    </div>
  );
}
