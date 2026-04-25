"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAlchemyConnectAfterAuth } from "@/hooks/useAlchemyConnectAfterAuth";
import { AlchemyPostAuthPanel } from "@/components/AlchemyPostAuthPanel";

export default function LecturerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
  } = useAlchemyConnectAfterAuth("/lecturer/dashboard");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === "register") {
        await api("/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, role: "LECTURER" }),
        });
      } else {
        await api("/v1/auth/login", { method: "POST", body: JSON.stringify({ email }) });
      }
      if (hasAlchemy) beginWalletStep();
      else router.push("/lecturer/dashboard");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Lecturer</h1>
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
        roleLabel="Lecturer"
      />
      <button
        type="button"
        className="mt-4 text-sm text-slate-600 underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Create lecturer account" : "Sign in instead"}
      </button>
      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-slate-600 underline">
          Home
        </Link>
      </p>
    </div>
  );
}
