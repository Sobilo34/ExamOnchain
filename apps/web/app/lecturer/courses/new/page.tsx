"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function NewCoursePage() {
  const router = useRouter();
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [term, setTerm] = useState("");

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { course } = await api<{ course: { id: number } }>(
      "/v1/lecturer/courses",
      {
        method: "POST",
        body: JSON.stringify({ title, code, level, term }),
      },
    );
    router.push(`/lecturer/courses/${course.id}/edit`);
  };

  if (!me)
    return <div className="p-8 text-center text-slate-600">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-950">New course</h1>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Code e.g. CS101"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Level / class"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Term e.g. Fall 2026"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2 text-white"
          >
            Create
          </button>
        </form>
        <Link
          href="/lecturer/courses"
          className="mt-4 inline-block text-sm text-slate-600 underline"
        >
          Back
        </Link>
      </div>
    </AppShell>
  );
}
