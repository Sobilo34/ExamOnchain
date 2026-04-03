"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ email: string; smartAccountAddress: string | null } | null>(null);
  const [addr, setAddr] = useState("");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void api<{ email: string; smartAccountAddress: string | null }>("/v1/me")
      .then(setMe)
      .catch(() => router.push("/student/login"));
  }, [router]);

  const linkWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isAddress(addr)) {
      setErr("Invalid Ethereum address");
      return;
    }
    try {
      await api("/v1/me/wallet", { method: "POST", body: JSON.stringify({ smartAccountAddress: addr }) });
      const m = await api<{ smartAccountAddress: string | null }>("/v1/me");
      setMe((prev) => (prev ? { ...prev, smartAccountAddress: m.smartAccountAddress } : null));
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    }
  };

  if (!me) return <div className="p-8 text-center text-slate-600">Loading…</div>;

  return (
    <AppShell role="student" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold text-slate-900">Wallet onboarding</h1>
      <p className="mt-2 max-w-lg text-sm text-slate-600">
        Link your Alchemy smart account address (AA) so scores can be associated with your on-chain identity. Use
        Alchemy Account Kit in your own wallet flow, or paste a Sepolia smart account address for development.
      </p>
      <form onSubmit={(e) => void linkWallet(e)} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Smart account address</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="0x…"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          Save address
        </button>
      </form>
      <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        I have saved my wallet address somewhere safe
      </label>
      <button
        type="button"
        disabled={!saved}
        onClick={() => router.push("/student/dashboard")}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
      >
        Continue to dashboard
      </button>
    </AppShell>
  );
}
