"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href={`${base}/dashboard`} className="font-semibold text-slate-900">
              ExamOnchain
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              {role === "student" ? (
                <>
                  <Link href="/student/dashboard">Courses</Link>
                  <Link href="/student/records">Records</Link>
                </>
              ) : (
                <>
                  <Link href="/lecturer/dashboard">Dashboard</Link>
                  <Link href="/lecturer/courses">Courses</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {email && <span>{email}</span>}
            {wallet && (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700" title="Smart account">
                {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </code>
            )}
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900">Sepolia</span>
            <button type="button" onClick={() => void logout()} className="text-slate-500 underline">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
