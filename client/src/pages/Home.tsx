import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { useFeatured, useProducts } from '../lib/hooks';
import { CATEGORIES } from '../lib/categories';
import { discountPercent } from '../lib/format';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import { Spinner } from '../components/ui';

const BRANDS = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'ASUS', 'Logitech', 'Bose', 'Google', 'Nintendo'];

function SectionHeader({ title, to, icon }: { title: string; to: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-fg md:text-2xl">
        {icon} {title}
      </h2>
      <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        View all <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading } = useFeatured();
  const { data: latest } = useProducts({ sort: 'newest', limit: 24 });

  const deals = (latest?.products ?? [])
    .filter((p) => discountPercent(p.price, p.oldPrice) > 0)
    .slice(0, 10);

  return (
    <div className="container-wide py-6">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeroSlider />
        </div>
        <div className="hidden grid-rows-2 gap-4 lg:grid">
          <Link to="/shop?category=LAPTOP" className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Work & play</p>
            <p className="mt-1 font-display text-2xl font-extrabold">Laptops for every pro</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Shop now <ArrowRight size={15} /></span>
          </Link>
          <Link to="/shop?category=WEARABLE" className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Stay connected</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-fg">Smartwatches</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">Shop now <ArrowRight size={15} /></span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to={`/shop?category=${c.key}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-pop"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-brand-fg">
                <c.icon size={22} />
              </span>
              <span className="text-xs font-semibold text-fg">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Deals of the week" to="/shop?sort=price-asc" icon={<Flame size={20} className="text-deal" />} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {deals.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Promo banners */}
      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <Link to="/shop?category=AUDIO" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-400 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Up to 20% off</p>
          <p className="mt-2 font-display text-3xl font-extrabold">Premium audio sale</p>
          <p className="mt-1 max-w-xs text-sm text-white/85">Headphones & speakers from the best brands.</p>
          <span className="btn mt-5 bg-white text-fg hover:bg-white/90">Shop audio <ArrowRight size={15} /></span>
        </Link>
        <Link to="/shop?category=GAMING" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-orange-400 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">New arrivals</p>
          <p className="mt-2 font-display text-3xl font-extrabold">Gaming HQ</p>
          <p className="mt-1 max-w-xs text-sm text-white/85">Consoles, monitors & accessories.</p>
          <span className="btn mt-5 bg-white text-fg hover:bg-white/90">Shop gaming <ArrowRight size={15} /></span>
        </Link>
      </section>

      {/* Featured */}
      <section className="mt-12">
        <SectionHeader title="Featured products" to="/shop" />
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-brand" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(featured?.products ?? []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="mt-12">
        <SectionHeader title="New arrivals" to="/shop?sort=newest" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(latest?.products ?? []).slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="mt-14 overflow-hidden rounded-2xl border border-line bg-surface py-6">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-display text-xl font-bold text-muted/70">{b}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
