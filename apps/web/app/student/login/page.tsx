"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === "register") {
        await api("/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, studentId, role: "STUDENT" }),
        });
      } else {
        await api("/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, studentId }),
        });
      }
      router.push("/student/onboarding");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Student</h1>
      <p className="mt-2 text-sm text-slate-600">Institutional email and student ID.</p>
      <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Student ID</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white">
          {mode === "login" ? "Sign in" : "Register"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-slate-600 underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
      </button>
      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-slate-600 underline">
          Home
        </Link>
      </p>
    </div>
  );
}
