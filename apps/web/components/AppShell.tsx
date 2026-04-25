"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { appBrand, networkConfig } from "@/lib/brand";
import { FutminnaMark } from "@/components/FutminnaMark";

export function AppShell({
  role,
  email,
  wallet,
  children,
}: {
  role: "student" | "lecturer";
  email?: string;
  wallet?: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const base = role === "student" ? "/student" : "/lecturer";
  const logout = async () => {
    await api("/v1/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(247,244,237,1),_rgba(243,246,251,1))]">
      <header className="border-b border-slate-900/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`${base}/dashboard`}
              className="flex items-center gap-3"
            >
              <FutminnaMark size={40} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {appBrand.institutionShortName}
                </p>
                <p className="font-semibold text-slate-950">
                  {appBrand.appName}
                </p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-slate-700">
              {role === "student" ? (
                <>
                  <Link href="/student/dashboard">Courses</Link>
                  <Link href="/student/records">Records</Link>
                  {!wallet && (
                    <Link href="/student/onboarding">Link wallet</Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/lecturer/dashboard">Dashboard</Link>
                  <Link href="/lecturer/courses">Courses</Link>
                  {!wallet && (
                    <Link href="/lecturer/onboarding">Link wallet</Link>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 font-semibold text-slate-700">
              {networkConfig.chainName}
            </span>
            {email && (
              <span className="max-w-[14rem] truncate rounded-full bg-white px-3 py-1">
                {email}
              </span>
            )}
            {wallet && (
              <code
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-700"
                title="Smart account"
              >
                {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </code>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="text-slate-500 underline decoration-slate-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
