import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../store/auth';
import { cn } from '../lib/format';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-white/[0.06] bg-ink-950 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-white">
            KEY<span className="text-accent">CULT</span>
          </Link>
          <span className="badge bg-accent/15 text-accent-soft">Admin</span>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:flex-none',
                  isActive ? 'bg-accent/15 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-white/[0.06] p-3 md:absolute md:bottom-0 md:block md:w-64">
          <div className="px-2 py-2 text-xs text-zinc-500">Signed in as {user?.name}</div>
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-white/5"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-ink-950/40 px-5 py-7 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
