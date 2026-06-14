import { useId } from 'react';

interface Props {
  /** size of the square mark in px */
  size?: number;
  /** hide the KEYCULT wordmark, show only the mark */
  markOnly?: boolean;
  className?: string;
}

/**
 * KEYCULT brand logo: a gradient rounded-square mark containing a stylized "K"
 * built from a power/connect motif, plus the wordmark. Works on light & dark.
 */
export default function Logo({ size = 34, markOnly = false, className = '' }: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`kc-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c63ff" />
            <stop offset="1" stopColor="#4326c8" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="37" height="37" rx="10" fill={`url(#kc-${id})`} />
        <path
          d="M14 10v20M14 20l9.5-10M14 20l9.5 10"
          stroke="#fff"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28.5" cy="11" r="2.1" fill="#2dd4b2" />
      </svg>
      {!markOnly && (
        <span className="font-display text-[1.35rem] font-extrabold leading-none tracking-tight text-fg">
          KEY<span className="text-brand">CULT</span>
        </span>
      )}
    </span>
  );
}
