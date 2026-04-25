"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { uploadMaterial } from "@/lib/api";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function MaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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

  const onFile = async (f: FileList | null) => {
    if (!f?.[0]) return;
    setStatus("Uploading…");
    try {
      const r = await uploadMaterial(courseId, f[0]);
      setStatus(`Uploaded: ${r.material.cid}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!me)
    return <div className="p-8 text-center text-slate-600">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold">Materials</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload handouts (text-friendly files work best for AI extraction).
        </p>
        <input
          type="file"
          className="mt-4 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"
          onChange={(e) => void onFile(e.target.files)}
        />
        {status && <p className="mt-4 text-sm">{status}</p>}
        <Link
          href={`/lecturer/courses/${courseId}/edit`}
          className="mt-6 inline-block text-sm underline"
        >
          Back
        </Link>
      </div>
    </AppShell>
  );
}
