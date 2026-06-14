import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, LogOut, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../store/auth';
import { useTheme } from '../store/theme';
import { cn } from '../lib/format';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <aside className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Link to="/"><Logo size={30} /></Link>
          <span className="badge bg-brand/10 text-brand">Admin</span>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition md:flex-none',
                  isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-surface2 hover:text-fg'
                )
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-line p-3 md:block">
          <div className="px-2 py-2 text-xs text-muted">Signed in as {user?.name}</div>
          <button onClick={toggle} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-fg">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-fg">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-deal hover:bg-surface2">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-5 py-7 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
