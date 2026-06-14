import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-950">
      <div className="container-wide grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-white">
            KEY<span className="text-accent">CULT</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
            Premium mechanical keyboards & artisan accessories for people who type with intent.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Shop</h4>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li><Link to="/shop?category=KEYBOARD" className="hover:text-white">Keyboards</Link></li>
            <li><Link to="/shop?category=KEYCAP" className="hover:text-white">Keycaps</Link></li>
            <li><Link to="/shop?category=SWITCH" className="hover:text-white">Switches</Link></li>
            <li><Link to="/shop?category=ACCESSORY" className="hover:text-white">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Company</h4>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li><Link to="/shop" className="hover:text-white">All products</Link></li>
            <li><Link to="/account/orders" className="hover:text-white">Track order</Link></li>
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Demo</h4>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li>Test card: 4242 4242 4242 4242</li>
            <li>Any future date · any CVC</li>
            <li>Stripe test mode</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-5 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} KEYCULT. Portfolio demo — not a real store.</p>
          <p>Built with React, Express, Prisma, Stripe & Neon.</p>
        </div>
      </div>
    </footer>
  );
}
