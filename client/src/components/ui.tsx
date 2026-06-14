import { ReactNode } from 'react';
import { Loader2, Star } from 'lucide-react';
import { cn } from '../lib/format';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />;
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="h-7 w-7 text-brand" />
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
      <h3 className="text-lg font-bold text-fg">{title}</h3>
      {subtitle && <p className="max-w-sm text-sm text-muted">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-line'}
          />
        ))}
      </div>
      {count !== undefined && <span className="ml-0.5">({count})</span>}
    </div>
  );
}
