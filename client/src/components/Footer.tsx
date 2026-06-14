import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react';
import Logo from './Logo';
import { CATEGORIES } from '../lib/categories';

const perks = [
  { icon: Truck, title: 'Free shipping', desc: 'On orders over $99' },
  { icon: RotateCcw, title: '30-day returns', desc: 'Hassle-free' },
  { icon: ShieldCheck, title: '2-year warranty', desc: 'On all devices' },
  { icon: CreditCard, title: 'Secure payment', desc: 'Stripe protected' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      {/* Perks */}
      <div className="border-b border-line">
        <div className="container-wide grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <p.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-fg">{p.title}</p>
                <p className="text-xs text-muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wide grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Electronics, unlocked. The latest phones, laptops, audio and smart gear — at prices that make sense.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Shop</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.key}>
                <Link to={`/shop?category=${c.key}`} className="link-muted">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="link-muted">All products</Link></li>
            <li><Link to="/account/orders" className="link-muted">Track order</Link></li>
            <li><a href="#" className="link-muted">About us</a></li>
            <li><a href="#" className="link-muted">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Demo info</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>Test card: 4242 4242 4242 4242</li>
            <li>Any future date · any CVC</li>
            <li>Stripe test mode — no real charges</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} KEYCULT. Portfolio demo — not a real store.</p>
          <p>React · Express · Prisma · Stripe · Neon</p>
        </div>
      </div>
    </footer>
  );
}
