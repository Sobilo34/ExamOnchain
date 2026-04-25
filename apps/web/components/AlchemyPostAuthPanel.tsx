"use client";

type Props = {
  email: string;
  phase: "idle" | "wallet";
  walletErr: string | null;
  isLinking: boolean;
  onReopenModal: () => void;
  onRetryLink: () => void;
  roleLabel: string;
};

export function AlchemyPostAuthPanel({
  email,
  phase,
  walletErr,
  isLinking,
  onReopenModal,
  onRetryLink,
  roleLabel,
}: Props) {
  if (phase !== "wallet") return null;

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-slate-800">
      <p className="font-medium text-indigo-950">Create your smart wallet</p>
      <p className="text-slate-700">
        Alchemy signs you in with email and keeps your smart account in this browser. In the Alchemy step, use the same email as{" "}
        <span className="font-mono text-xs">{email}</span> so recovery on another device matches this profile.
      </p>
      <p className="text-slate-600">
        {roleLabel}: complete the email step in the Alchemy window (code or link). You stay signed in here until you log out or clear site data.
      </p>
      {isLinking && <p className="text-slate-600">Saving wallet to your {roleLabel} profile…</p>}
      {walletErr && (
        <div className="space-y-2">
          <p className="text-red-700">{walletErr}</p>
          <button
            type="button"
            onClick={onRetryLink}
            className="text-sm font-medium text-indigo-800 underline"
          >
            Retry saving wallet
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={onReopenModal}
        className="rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-900 shadow-sm hover:bg-indigo-50"
      >
        Open email sign-in again
      </button>
    </div>
  );
}
