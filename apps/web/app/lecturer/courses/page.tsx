"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function LecturerCoursesPage() {
  const router = useRouter();
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [courses, setCourses] = useState<
    {
      id: number;
      title: string;
      code: string;
      level: string;
      term: string;
      joinCode: string | null;
    }[]
  >([]);

  useEffect(() => {
    void api<{
      email: string;
      smartAccountAddress: string | null;
      role: string;
    }>("/v1/me")
      .then((m) => {
        if (m.role !== "LECTURER") router.push("/");
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <Link
          href="/lecturer/courses/new"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
        >
          New course
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {courses.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
          >
            <Link
              href={`/lecturer/courses/${c.id}/edit`}
              className="font-medium text-slate-900 hover:underline"
            >
              {c.code} — {c.title}
            </Link>
            <p className="text-xs text-slate-500">
              {c.level} · {c.term} · join: <code>{c.joinCode}</code>
            </p>
            <div className="mt-2 flex gap-3 text-sm">
              <Link
                className="text-sky-700 underline"
                href={`/lecturer/courses/${c.id}/roster`}
              >
                Roster
              </Link>
              <Link
                className="text-sky-700 underline"
                href={`/lecturer/courses/${c.id}/materials`}
              >
                Materials
              </Link>
              <Link
                className="text-sky-700 underline"
                href={`/lecturer/courses/${c.id}/exams/new`}
              >
                New exam
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
