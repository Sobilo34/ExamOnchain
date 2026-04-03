"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

type Course = {
  id: number;
  title: string;
  code: string;
  level: string;
  term: string;
  exams: { id: number; title: string; opensAt: string; closesAt: string }[];
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    void Promise.all([
      api<{ email: string; smartAccountAddress: string | null }>("/v1/me").catch(() => null),
      api<{ courses: Course[] }>("/v1/student/courses").catch(() => ({ courses: [] })),
    ]).then(([m, c]) => {
      if (!m) {
        router.push("/student/login");
        return;
      }
      setMe(m);
      setCourses(c.courses);
    });
  }, [router]);

  const enroll = async () => {
    if (!joinCode.trim()) return;
    await api("/v1/student/enroll", { method: "POST", body: JSON.stringify({ joinCode: joinCode.trim() }) });
    const c = await api<{ courses: Course[] }>("/v1/student/courses");
    setCourses(c.courses);
    setJoinCode("");
  };

  if (!me) return <div className="p-8 text-center">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold">Your courses</h1>
      <div className="mt-4 flex max-w-md gap-2">
        <input
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Join code from lecturer"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button type="button" className="rounded bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => void enroll()}>
          Enroll
        </button>
      </div>
      <ul className="mt-8 space-y-4">
        {courses.map((c) => (
          <li key={c.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/student/course/${c.id}`} className="font-medium text-slate-900 hover:underline">
                {c.code} — {c.title}
              </Link>
              <span className="text-xs text-slate-500">
                {c.level} · {c.term}
              </span>
            </div>
            {c.exams.length > 0 && (
              <p className="mt-2 text-sm text-slate-600">{c.exams.length} published exam(s)</p>
            )}
          </li>
        ))}
      </ul>
      {courses.length === 0 && <p className="mt-6 text-slate-600">No enrollments yet. Enter a join code above.</p>}
    </AppShell>
  );
}
