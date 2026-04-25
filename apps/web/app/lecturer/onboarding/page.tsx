"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { useAccount, useAuthModal, useSignerStatus } from "@account-kit/react";
import { api } from "@/lib/api";
import {
  hasAlchemyApiKey,
  isAlchemyEmbeddedEmailEnabled,
} from "@/lib/account-kit-config";
import { AppShell } from "@/components/AppShell";
import { networkConfig } from "@/lib/brand";

export default function LecturerOnboardingPage() {
  const router = useRouter();
  const [me, setMe] = useState<{
    email: string;
    smartAccountAddress: string | null;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [openedModal, setOpenedModal] = useState(false);

  const signerStatus = useSignerStatus();
  const { openAuthModal } = useAuthModal();
  const { address, isLoadingAccount } = useAccount({ type: "LightAccount" });

  const [addr, setAddr] = useState("");

  useEffect(() => {
    void api<{
      email: string;
      smartAccountAddress: string | null;
      role: string;
    }>("/v1/me")
      .then((m) => {
        if (m.role !== "LECTURER") router.push("/");
        if (m.smartAccountAddress) {
          router.push("/lecturer/dashboard");
          return;
        }
        setMe(m);
      })
      .catch(() => router.push("/lecturer/login"));
  }, [router]);

  useEffect(() => {
    if (!me) return;
    if (me.smartAccountAddress) return;
    if (!isAlchemyEmbeddedEmailEnabled()) return;
    if (openedModal) return;
    if (!signerStatus.isConnected && !signerStatus.isAuthenticating) {
      setOpenedModal(true);
      openAuthModal();
    }
  }, [
    me,
    signerStatus.isConnected,
    signerStatus.isAuthenticating,
    openAuthModal,
    openedModal,
  ]);

  useEffect(() => {
    if (!me) return;
    if (me.smartAccountAddress) return;
    if (!address) return;
    if (linking) return;

    const smart = String(address);
    if (!isAddress(smart)) return;

    setLinking(true);
    setErr(null);
    void api("/v1/me/wallet", {
      method: "POST",
      body: JSON.stringify({ smartAccountAddress: smart }),
    })
      .then(async () => {
        const m = await api<{ smartAccountAddress: string | null }>("/v1/me");
        setMe((prev) =>
          prev ? { ...prev, smartAccountAddress: m.smartAccountAddress } : prev,
        );
      })
      .catch((x) => setErr(x instanceof Error ? x.message : "Failed"))
      .finally(() => setLinking(false));
  }, [me, address, linking]);

  const linkManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isAddress(addr)) {
      setErr("Invalid Ethereum address");
      return;
    }
    try {
      await api("/v1/me/wallet", {
        method: "POST",
        body: JSON.stringify({ smartAccountAddress: addr }),
      });
      const m = await api<{ smartAccountAddress: string | null }>("/v1/me");
      setMe((prev) =>
        prev ? { ...prev, smartAccountAddress: m.smartAccountAddress } : null,
      );
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    }
  };

  if (!me)
    return <div className="p-8 text-center text-slate-600">Loading…</div>;

  return (
    <AppShell role="lecturer" email={me.email} wallet={me.smartAccountAddress}>
      <h1 className="text-xl font-semibold text-slate-900">
        Lecturer wallet (Alchemy AA)
      </h1>
      <p className="mt-2 max-w-lg text-sm text-slate-600">
        Link a {networkConfig.chainName} smart account to your profile. With
        embedded Alchemy email enabled, Account Kit can create one after email
        verification; otherwise paste an address below.
      </p>

      {!me.smartAccountAddress && (
        <>
          <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            {isAlchemyEmbeddedEmailEnabled() ? (
              <>
                <p className="font-medium">
                  Creating your Alchemy smart account…
                </p>
                <p className="mt-2">
                  {isLoadingAccount ||
                  signerStatus.isAuthenticating ||
                  signerStatus.isInitializing ? (
                    <span>Working…</span>
                  ) : (
                    <span>Waiting for authentication…</span>
                  )}
                </p>
              </>
            ) : hasAlchemyApiKey() ? (
              <>
                <p className="font-medium">
                  Embedded Alchemy email sign-in is off.
                </p>
                <p className="mt-1 text-amber-900/80">
                  Paste your {networkConfig.chainName} smart account address
                  below. To re-enable email OTP later, uncomment `auth` in
                  `account-kit-config.ts` and set
                  `NEXT_PUBLIC_ALCHEMY_EMBEDDED_EMAIL=true`.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Alchemy API key missing.</p>
                <p className="mt-1 text-amber-900/80">
                  Set `NEXT_PUBLIC_ALCHEMY_API_KEY` in `apps/web/.env.local`, or
                  paste an address below.
                </p>
              </>
            )}
          </div>

          {!isAlchemyEmbeddedEmailEnabled() && (
            <form
              onSubmit={(e) => void linkManual(e)}
              className="mt-6 max-w-md space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Smart account address
                </label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
                  placeholder="0x…"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Save address
              </button>
            </form>
          )}

          {err && isAlchemyEmbeddedEmailEnabled() && (
            <p className="mt-4 text-sm text-red-600">{err}</p>
          )}
        </>
      )}

      {me.smartAccountAddress && (
        <div className="mt-6">
          <p className="text-sm text-slate-700">Wallet linked.</p>
          <button
            type="button"
            onClick={() => router.push("/lecturer/dashboard")}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Continue to dashboard
          </button>
        </div>
      )}
    </AppShell>
  );
}
