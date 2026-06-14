import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Menu, X, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { cn } from '../lib/format';

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=KEYBOARD', label: 'Keyboards' },
  { to: '/shop?category=KEYCAP', label: 'Keycaps' },
  { to: '/shop?category=SWITCH', label: 'Switches' },
];

export default function Navbar() {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <nav className="container-wide flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl font-bold tracking-[0.2em] text-white">
          KEY<span className="text-accent">CULT</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-zinc-400 transition hover:text-white',
                  isActive && 'text-white'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('/shop')}
            className="hidden h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white sm:grid"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Account */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link
                to="/login"
                className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Account"
              >
                <UserIcon size={18} />
              </Link>
            )}

            {user && menuOpen && (
              <div className="card absolute right-0 top-11 w-52 overflow-hidden p-1.5 shadow-2xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="my-1 h-px bg-white/5" />
                <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
                  <UserIcon size={15} /> My account
                </Link>
                <Link to="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
                  <ShoppingBag size={15} /> My orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent-soft hover:bg-white/5">
                    <LayoutDashboard size={15} /> Admin panel
                  </Link>
                )}
                <div className="my-1 h-px bg-white/5" />
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-white/5"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative grid h-9 w-9 place-items-center rounded-full text-zinc-200 hover:bg-white/5"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-200 hover:bg-white/5 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-ink-950 md:hidden">
          <div className="container-wide flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm font-medium text-zinc-300"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
