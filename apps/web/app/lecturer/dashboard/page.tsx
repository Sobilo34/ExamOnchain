"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAlchemyEmbeddedEmailEnabled } from "@/lib/account-kit-config";
import { AppShell } from "@/components/AppShell";

export default function LecturerDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [courses, setCourses] = useState<{ id: number; title: string; code: string; _count: { exams: number } }[]>([]);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null; role: string }>("/v1/me")
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
    void api<{ courses: typeof courses }>("/v1/lecturer/courses").then((r) => setCourses(r.courses));
  }, []);

  if (!me) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        {courses.length} course(s). Draft exams: use course → new exam.
      </p>
      <Link href="/lecturer/courses" className="mt-6 inline-block text-sky-700 underline">
        Manage courses →
      </Link>
    </AppShell>
  );
}
