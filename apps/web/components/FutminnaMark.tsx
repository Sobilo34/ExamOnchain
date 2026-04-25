type FutminnaMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Crest-style mark inspired by the FUTMINNA logo, reused across app surfaces.
 */
export function FutminnaMark({ size = 44, className = "" }: FutminnaMarkProps) {
  const ring = Math.max(2, Math.floor(size * 0.06));
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[radial-gradient(circle_at_30%_20%,_#fff7df,_#f2e9d4_52%,_#e2d4b2)] shadow-[0_12px_34px_rgba(15,23,42,0.2)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size - ring * 2}
        height={size - ring * 2}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="#1f2558"
          strokeWidth="4"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="#7d68c6"
          strokeWidth="2.5"
          opacity="0.5"
        />
        <rect
          x="28"
          y="28"
          width="44"
          height="44"
          rx="10"
          transform="rotate(45 50 50)"
          stroke="#111827"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="8" fill="#111827" />
        <circle cx="50" cy="50" r="4" fill="#f6e5b4" />
      </svg>
    </div>
  );
}
