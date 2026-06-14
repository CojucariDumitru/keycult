import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, User as UserIcon, Menu, X, ChevronDown,
  LayoutDashboard, LogOut, Package, Sun, Moon, Truck, Headphones, Grid3x3,
} from 'lucide-react';
import Logo from './Logo';
import MegaMenu from './MegaMenu';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useAuth } from '../store/auth';
import { useTheme } from '../store/theme';
import { formatMoney, cn } from '../lib/format';
import { CATEGORIES } from '../lib/categories';

export default function Navbar() {
  const navigate = useNavigate();
  const cartCount = useCart((s) => s.count());
  const cartSubtotal = useCart((s) => s.subtotal());
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.count());
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const [search, setSearch] = useState('');
  const [searchCat, setSearchCat] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (searchCat) params.set('category', searchCat);
    navigate(`/shop?${params.toString()}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl">
      {/* Utility bar */}
      <div className="border-b border-line bg-canvas/60 text-xs">
        <div className="container-wide flex h-9 items-center justify-between">
          <span className="hidden items-center gap-1.5 text-muted sm:flex">
            <Truck size={14} className="text-brand" /> Free shipping on orders over $99 · ships nationwide
          </span>
          <span className="flex items-center gap-1.5 text-muted sm:hidden">
            <Truck size={14} className="text-brand" /> Free shipping over $99
          </span>
          <div className="flex items-center gap-4">
            <Link to="/account/orders" className="link-muted hidden sm:inline">Track order</Link>
            <a href="#" className="link-muted hidden items-center gap-1 sm:inline-flex">
              <Headphones size={13} /> Help
            </a>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-muted transition hover:bg-surface2 hover:text-fg"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="border-b border-line">
        <div className="container-wide flex h-[68px] items-center gap-4">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl text-fg hover:bg-surface2 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" aria-label="KEYCULT home">
            <Logo />
          </Link>

          {/* Search */}
          <form onSubmit={submitSearch} className="mx-auto hidden max-w-2xl flex-1 md:flex">
            <div className="flex w-full items-stretch rounded-xl border border-line bg-surface focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/15">
              <div className="relative">
                <select
                  value={searchCat}
                  onChange={(e) => setSearchCat(e.target.value)}
                  className="h-full cursor-pointer appearance-none rounded-l-xl border-r border-line bg-surface2 pl-3 pr-8 text-xs font-medium text-fg focus:outline-none"
                >
                  <option value="">All</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands…"
                className="flex-1 bg-transparent px-3.5 text-sm text-fg placeholder:text-muted/70 focus:outline-none"
              />
              <button type="submit" className="m-1 grid w-11 place-items-center rounded-lg bg-brand text-brand-fg hover:bg-brand-dark" aria-label="Search">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {/* account */}
            <div className="relative">
              <button
                onClick={() => (user ? setAccountOpen((o) => !o) : navigate('/login'))}
                onBlur={() => setTimeout(() => setAccountOpen(false), 160)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-fg hover:bg-surface2"
              >
                <UserIcon size={20} />
                <span className="hidden text-left lg:block">
                  <span className="block text-[10px] leading-tight text-muted">
                    {user ? 'Hi,' : 'Account'}
                  </span>
                  <span className="block text-xs font-semibold leading-tight">
                    {user ? user.name.split(' ')[0] : 'Sign in'}
                  </span>
                </span>
              </button>
              {user && accountOpen && (
                <div className="card absolute right-0 top-12 w-52 overflow-hidden p-1.5 shadow-pop">
                  <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface2">
                    <UserIcon size={15} /> My account
                  </Link>
                  <Link to="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface2">
                    <Package size={15} /> My orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand hover:bg-surface2">
                      <LayoutDashboard size={15} /> Admin panel
                    </Link>
                  )}
                  <div className="my-1 h-px bg-line" />
                  <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-deal hover:bg-surface2">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>

            <Link to="/wishlist" className="relative grid h-10 w-10 place-items-center rounded-xl text-fg hover:bg-surface2" aria-label="Wishlist">
              <Heart size={20} />
              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>

            <button onClick={openCart} className="relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-fg hover:bg-surface2" aria-label="Cart">
              <span className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && <Badge>{cartCount}</Badge>}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-[10px] leading-tight text-muted">Cart</span>
                <span className="block text-xs font-semibold leading-tight">{formatMoney(cartSubtotal)}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Category row */}
      <div className="border-b border-line bg-surface">
        <div className="container-wide hidden h-12 items-center gap-1 lg:flex" ref={megaRef}>
          <div className="relative">
            <button
              onClick={() => setMegaOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg"
            >
              <Grid3x3 size={16} /> All Categories <ChevronDown size={15} className={cn('transition', megaOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>{megaOpen && <MegaMenu onNavigate={() => setMegaOpen(false)} />}</AnimatePresence>
          </div>

          <nav className="ml-2 flex items-center gap-1">
            {CATEGORIES.slice(0, 6).map((c) => (
              <NavLink
                key={c.key}
                to={`/shop?category=${c.key}`}
                className={({ isActive }) =>
                  cn('rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-surface2 hover:text-brand',
                    isActive ? 'text-brand' : 'text-fg')
                }
              >
                {c.label}
              </NavLink>
            ))}
            <Link to="/shop?sort=price-asc" className="ml-1 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-deal hover:bg-deal/10">
              🔥 Top Deals
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-b border-line bg-surface lg:hidden">
          <div className="container-wide space-y-4 py-4">
            <form onSubmit={submitSearch} className="flex items-stretch rounded-xl border border-line bg-surface">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none" />
              <button type="submit" className="m-1 grid w-10 place-items-center rounded-lg bg-brand text-brand-fg"><Search size={17} /></button>
            </form>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <Link key={c.key} to={`/shop?category=${c.key}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg p-2 text-sm text-fg hover:bg-surface2">
                  <c.icon size={16} className="text-brand" /> {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-deal px-1 text-[10px] font-bold text-white">
      {children}
    </span>
  );
}
