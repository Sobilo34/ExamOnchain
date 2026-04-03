"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function ExamInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [exam, setExam] = useState<{
    id: number;
    title: string;
    durationMinutes: number;
    opensAt: string;
    closesAt: string;
    eligible: boolean;
    started: boolean;
  } | null>(null);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me")
      .then(setMe)
      .catch(() => router.push("/student/login"));
  }, [router]);

  useEffect(() => {
    if (!examId) return;
    void api<NonNullable<typeof exam>>(`/v1/student/exams/${examId}`)
      .then(setExam)
      .catch(() => router.push("/student/dashboard"));
  }, [examId, router]);

  if (!me || !exam) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold">{exam.title}</h1>
      <p className="mt-2 text-sm text-slate-600">Duration: {exam.durationMinutes} minutes (server-enforced window).</p>
      <p className="mt-4 text-sm text-slate-600">
        By starting, you confirm you will complete your own work. Scores may be anchored on Sepolia for verification.
      </p>
      {!exam.eligible && <p className="mt-4 text-amber-800">This exam is outside the scheduled window.</p>}
      {exam.eligible && (
        <button
          type="button"
          className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm text-white"
          onClick={() => router.push(`/student/exam/${examId}/attempt`)}
        >
          {exam.started ? "Continue exam" : "Start exam"}
        </button>
      )}
      <p className="mt-8">
        <Link href="/student/dashboard" className="text-sm text-slate-600 underline">
          Back
        </Link>
      </p>
    </AppShell>
  );
}
