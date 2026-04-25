"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

type CourseDetail = {
  id: number;
  title: string;
  code: string;
  level: string;
  term: string;
  materials: { id: number; name: string; cid: string }[];
  exams: {
    id: number;
    title: string;
    status: string;
    opensAt: string;
    closesAt: string;
    durationMinutes: number;
  }[];
};

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me")
      .then(setMe)
      .catch(() => router.push("/student/login"));
  }, [router]);

  useEffect(() => {
    if (!courseId) return;
    void api<{ course: CourseDetail }>(`/v1/student/courses/${courseId}`)
      .then((r) => setCourse(r.course))
      .catch(() => router.push("/student/dashboard"));
  }, [courseId, router]);

  if (!me || !course) return <div className="p-8 text-center">Loading…</div>;

  const now = Date.now();

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <Link
        href="/student/dashboard"
        className="text-sm text-slate-600 hover:underline"
      >
        ← Courses
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">
        {course.code} — {course.title}
      </h1>
      <p className="text-sm text-slate-500">
        {course.level} · {course.term}
      </p>
      <h2 className="mt-8 text-sm font-medium text-slate-700">Materials</h2>
      <ul className="mt-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 backdrop-blur">
        {course.materials.map((m) => (
          <li key={m.id}>
            {m.name} <span className="text-slate-400">({m.cid})</span>
          </li>
        ))}
        {course.materials.length === 0 && <li>No materials yet.</li>}
      </ul>
      <h2 className="mt-8 text-sm font-medium text-slate-700">Exams</h2>
      <table className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 text-sm backdrop-blur">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Title</th>
            <th>Window</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {course.exams.map((e) => {
            const open = new Date(e.opensAt).getTime();
            const close = new Date(e.closesAt).getTime();
            const live = now >= open && now <= close;
            const done = now > close;
            return (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="py-2">{e.title}</td>
                <td className="text-slate-600">
                  {new Date(e.opensAt).toLocaleString()} –{" "}
                  {new Date(e.closesAt).toLocaleString()}
                </td>
                <td>
                  {live && (
                    <Link
                      className="text-sky-700 underline"
                      href={`/student/exam/${e.id}/instructions`}
                    >
                      Open
                    </Link>
                  )}
                  {done && <span className="text-slate-400">Closed</span>}
                  {!live && !done && (
                    <span className="text-slate-400">Upcoming</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {course.exams.length === 0 && (
        <p className="mt-2 text-slate-600">No published exams.</p>
      )}
    </AppShell>
  );
}
