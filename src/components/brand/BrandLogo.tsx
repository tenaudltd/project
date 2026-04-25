import clsx from "clsx";
import type { SVGProps } from "react";

function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="brand-logo-gradient" x1="9" y1="8" x2="67" y2="72">
          <stop offset="0" stopColor="#f4b056" />
          <stop offset="0.45" stopColor="#ef6b44" />
          <stop offset="1" stopColor="#10606b" />
        </linearGradient>
      </defs>
      <rect
        x="6"
        y="6"
        width="68"
        height="68"
        rx="22"
        fill="url(#brand-logo-gradient)"
      />
      <path
        d="M20 57V24l15.5 18L51 24v33"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 60h44"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="58" cy="21" r="7" fill="#f8f2df" />
      <path
        d="M58 14v14M51 21h14"
        stroke="#0e3b43"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <BrandMark className={clsx("h-11 w-11 shrink-0", compact && "h-10 w-10")} />
      {!compact && (
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-lg font-semibold tracking-[0.18em] text-ink-900">
            CIVICED
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary-700">
            Mushindamo
          </span>
        </div>
      )}
    </div>
  );
}
