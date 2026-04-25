"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAlchemyEmbeddedEmailEnabled } from "@/lib/account-kit-config";
import { AppShell } from "@/components/AppShell";

export default function LecturerDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [courses, setCourses] = useState<
    { id: number; title: string; code: string; _count: { exams: number } }[]
  >([]);

  useEffect(() => {
    void api<{
      email: string;
      smartAccountAddress: string | null;
      role: string;
    }>("/v1/me")
      .then((m) => {
        if (m.role !== "LECTURER") router.push("/");
        if (!m.smartAccountAddress && isAlchemyEmbeddedEmailEnabled()) {
          router.push("/lecturer/onboarding");
          return;
        }
        setMe(m);
      })
      .catch(() => router.push("/lecturer/login"));
  }, [router]);

  useEffect(() => {
    void api<{ courses: typeof courses }>("/v1/lecturer/courses").then((r) =>
      setCourses(r.courses),
    );
  }, []);

  if (!me) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Lecturer workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {courses.length} course(s). Draft exams: use course → new exam.
        </p>
        <Link
          href="/lecturer/courses"
          className="mt-6 inline-block rounded-full border border-slate-900/10 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Manage courses
        </Link>
      </div>
    </AppShell>
  );
}
