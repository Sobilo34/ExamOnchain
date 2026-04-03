import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-slate-800">ExamOnchain</span>
          <div className="flex gap-4 text-sm">
            <Link className="text-slate-600 hover:text-slate-900" href="/student/login">
              Student
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/lecturer/login">
              Lecturer
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Decentralized assessments</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Transparent score anchoring on Ethereum Sepolia, personalized exams, and lecturer tooling for courses and
          materials.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/student/login"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Student sign in
          </Link>
          <Link
            href="/lecturer/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Lecturer sign in
          </Link>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500">
        PII stays off-chain; exam commitments can be anchored on Sepolia.
      </footer>
    </div>
  );
}
