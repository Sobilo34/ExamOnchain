"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAlchemyConnectAfterAuth } from "@/hooks/useAlchemyConnectAfterAuth";
import { AlchemyPostAuthPanel } from "@/components/AlchemyPostAuthPanel";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState<string | null>(null);

  const {
    phase,
    beginWalletStep,
    walletErr,
    isLinking,
    reopenAlchemy,
    retryLink,
    hasAlchemy,
  } = useAlchemyConnectAfterAuth("/student/dashboard");

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
      if (hasAlchemy) beginWalletStep();
      else router.push("/student/dashboard");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Student</h1>
      <p className="mt-2 text-sm text-slate-600">
        Institutional email and student ID (for exams). Your smart wallet uses the same email with Alchemy for sign-in and recovery.
      </p>
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
        <button
          type="submit"
          disabled={phase === "wallet"}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {phase === "wallet"
            ? "Finish wallet step below…"
            : mode === "login"
              ? "Sign in"
              : "Register"}
        </button>
      </form>
      <AlchemyPostAuthPanel
        email={email}
        phase={phase}
        walletErr={walletErr}
        isLinking={isLinking}
        onReopenModal={reopenAlchemy}
        onRetryLink={retryLink}
        roleLabel="Student"
      />
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
