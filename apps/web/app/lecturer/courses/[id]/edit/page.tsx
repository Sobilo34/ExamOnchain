"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function EditCoursePage() {
  const params = useParams();
  const id = Number(params.id);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [term, setTerm] = useState("");

  useEffect(() => {
    void api<{ course: { title: string; code: string; level: string; term: string } }>(`/v1/lecturer/courses/${id}`).then(
      (r) => {
        setTitle(r.course.title);
        setCode(r.course.code);
        setLevel(r.course.level);
        setTerm(r.course.term);
      }
    );
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api(`/v1/lecturer/courses/${id}`, { method: "PATCH", body: JSON.stringify({ title, code, level, term }) });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold">Edit course</h1>
      <form onSubmit={(e) => void save(e)} className="mt-6 space-y-4">
        <input className="w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" value={term} onChange={(e) => setTerm(e.target.value)} />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-white">
          Save
        </button>
      </form>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href={`/lecturer/courses/${id}/roster`} className="text-sky-700 underline">
          Roster
        </Link>
        <Link href={`/lecturer/courses/${id}/materials`} className="text-sky-700 underline">
          Materials
        </Link>
        <Link href={`/lecturer/courses/${id}/exams/new`} className="text-sky-700 underline">
          New exam
        </Link>
      </div>
    </div>
  );
}
