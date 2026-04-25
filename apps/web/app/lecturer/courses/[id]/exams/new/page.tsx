"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function NewExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [title, setTitle] = useState("Midterm");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [source, setSource] = useState<"AI_MATERIALS" | "FILE_UPLOAD">(
    "AI_MATERIALS",
  );

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
    const { exam } = await api<{ exam: { id: number } }>(
      `/v1/lecturer/courses/${courseId}/exams`,
      {
        method: "POST",
        body: JSON.stringify({
          title,
          opensAt: new Date(opensAt).toISOString(),
          closesAt: new Date(closesAt).toISOString(),
          durationMinutes,
          questionSource: source,
        }),
      },
    );
    router.push(`/lecturer/exams/${exam.id}/draft`);
  };

  if (!me)
    return <div className="p-8 text-center text-slate-600">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold">New exam</h1>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="block text-xs text-slate-600">
            Opens (local time)
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            type="datetime-local"
            value={opensAt}
            onChange={(e) => setOpensAt(e.target.value)}
            required
          />
          <label className="block text-xs text-slate-600">Closes</label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            required
          />
          <input
            type="number"
            className="w-full rounded-xl border px-3 py-2"
            value={durationMinutes}
            min={1}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={source}
            onChange={(e) =>
              setSource(e.target.value as "AI_MATERIALS" | "FILE_UPLOAD")
            }
          >
            <option value="AI_MATERIALS">Questions from AI + materials</option>
            <option value="FILE_UPLOAD">
              Upload question file (use draft editor)
            </option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2 text-white"
          >
            Create draft
          </button>
        </form>
        <Link
          href={`/lecturer/courses`}
          className="mt-4 inline-block text-sm underline"
        >
          Back
        </Link>
      </div>
    </AppShell>
  );
}
