import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/format';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />;
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-500">
      <Spinner className="h-7 w-7 text-accent" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="max-w-sm text-sm text-zinc-400">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.round(value) ? 'text-amber-400' : 'text-zinc-700'}>
            ★
          </span>
        ))}
      </div>
      <span>{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-zinc-600">({count})</span>}
    </div>
  );
}
