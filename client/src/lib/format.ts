/** Format a cents amount as a currency string. */
export function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  KEYBOARD: 'Keyboards',
  KEYCAP: 'Keycaps',
  SWITCH: 'Switches',
  ACCESSORY: 'Accessories',
  DESKMAT: 'Deskmats',
};

export const categoryLabel = (c: string) => CATEGORY_LABELS[c] ?? c;

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300',
  PAID: 'bg-emerald-500/15 text-emerald-300',
  PROCESSING: 'bg-sky-500/15 text-sky-300',
  SHIPPED: 'bg-indigo-500/15 text-indigo-300',
  DELIVERED: 'bg-emerald-600/20 text-emerald-300',
  CANCELLED: 'bg-zinc-500/15 text-zinc-400',
  REFUNDED: 'bg-rose-500/15 text-rose-300',
};

export const statusStyle = (s: string) => STATUS_STYLES[s] ?? 'bg-zinc-500/15 text-zinc-400';
