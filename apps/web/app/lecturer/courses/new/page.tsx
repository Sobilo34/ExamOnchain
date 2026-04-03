"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [term, setTerm] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { course } = await api<{ course: { id: number } }>("/v1/lecturer/courses", {
      method: "POST",
      body: JSON.stringify({ title, code, level, term }),
    });
    router.push(`/lecturer/courses/${course.id}/edit`);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold">New course</h1>
      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
        <input className="w-full rounded border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="w-full rounded border px-3 py-2" placeholder="Code e.g. CS101" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input className="w-full rounded border px-3 py-2" placeholder="Level / class" value={level} onChange={(e) => setLevel(e.target.value)} required />
        <input className="w-full rounded border px-3 py-2" placeholder="Term e.g. Fall 2026" value={term} onChange={(e) => setTerm(e.target.value)} required />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-white">
          Create
        </button>
      </form>
      <Link href="/lecturer/courses" className="mt-4 inline-block text-sm text-slate-600 underline">
        Back
      </Link>
    </div>
  );
}
