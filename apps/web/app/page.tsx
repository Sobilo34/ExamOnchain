import Link from "next/link";
import { appBrand } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f4efe6] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,209,102,0.32),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(18,36,98,0.22),_transparent_28%),linear-gradient(135deg,_rgba(245,241,230,1),_rgba(235,241,249,0.82)_55%,_rgba(246,237,223,1))]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
      <header className="relative border-b border-slate-900/10 bg-white/55 px-6 py-4 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/10 bg-[#16162f] text-sm font-semibold text-white shadow-[0_12px_40px_rgba(15,23,42,0.25)]">
              FUT
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                {appBrand.institutionShortName}
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {appBrand.appName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              className="text-slate-700 transition hover:text-slate-950"
              href="/student/login"
            >
              Student
            </Link>
            <Link
              className="text-slate-700 transition hover:text-slate-950"
              href="/lecturer/login"
            >
              Lecturer
            </Link>
          </div>
        </nav>
      </header>
      <main className="relative mx-auto grid w-full max-w-7xl flex-1 gap-14 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm backdrop-blur">
            FUTMINNA · Sepolia · OpenRouter · Blockscout
          </div>
          <h1 className="mt-8 text-5xl leading-[0.95] font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Decentralized assessments for a serious university.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            {appBrand.appName} gives FUTMINNA a transparent assessment stack:
            AI-assisted question extraction with OpenRouter, personalized
            attempts, real-time scoring, and immutable score anchoring on
            Ethereum Sepolia.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/student/login"
              className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(17,24,39,0.28)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              Student sign in
            </Link>
            <Link
              href="/lecturer/login"
              className="rounded-full border border-slate-900/15 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
            >
              Lecturer sign in
            </Link>
          </div>
          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              [
                "Tamper-evident",
                "Score anchors and exam hashes stay on Sepolia.",
              ],
              [
                "AI-assisted",
                "OpenRouter extracts questions from notes and quizzes.",
              ],
              [
                "Institution-first",
                "FUTMINNA branding stays visible across the full flow.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute inset-0 -z-10 rounded-[2rem] border border-slate-900/5 bg-white/40 blur-0" />
          <div className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ee]/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Campus identity
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {appBrand.institutionShortName}
                </h2>
              </div>
              <div className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-800">
                Sepolia live
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-[#352d6d]/15 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.95),_rgba(247,241,231,0.88)_45%,_rgba(211,189,140,0.18))] shadow-[inset_0_0_0_16px_rgba(18,36,98,0.04)]">
                <div className="absolute inset-6 rounded-full border border-[#7b68d1]/18" />
                <div className="absolute inset-14 rounded-full border border-slate-900/10 bg-white/55" />
                <div className="absolute inset-24 rotate-45 rounded-[2rem] border border-slate-900/12 bg-white/70" />
                <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full border border-slate-900/10 bg-[#121630] text-center text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_22px_40px_rgba(15,23,42,0.3)]">
                  FUTMINNA
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["AI pipeline", "OpenRouter extraction and exam drafting"],
                ["Blockchain trail", "Sepolia registry + score anchoring"],
                ["Explorer", "Blockscout by default for verification"],
                ["Identity", "Smart accounts for students and lecturers"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-900/10 bg-white/75 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {title}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="relative border-t border-slate-900/10 bg-white/45 px-6 py-6 text-center text-xs uppercase tracking-[0.28em] text-slate-600 backdrop-blur">
        {appBrand.appName} for {appBrand.institutionShortName} · PII stays
        off-chain · verification defaults to Blockscout
      </footer>
    </div>
  );
}
