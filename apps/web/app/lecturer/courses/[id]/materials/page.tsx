"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { uploadMaterial } from "@/lib/api";

export default function MaterialsPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const [status, setStatus] = useState<string | null>(null);

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

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold">Materials</h1>
      <p className="mt-2 text-sm text-slate-600">Upload handouts (text-friendly files work best for AI extraction).</p>
      <input
        type="file"
        className="mt-4 block w-full text-sm"
        onChange={(e) => void onFile(e.target.files)}
      />
      {status && <p className="mt-4 text-sm">{status}</p>}
      <Link href={`/lecturer/courses/${courseId}/edit`} className="mt-6 inline-block text-sm underline">
        Back
      </Link>
    </div>
  );
}
