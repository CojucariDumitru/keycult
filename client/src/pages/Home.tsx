import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import { useFeatured, useCategories } from '../lib/hooks';
import { categoryLabel } from '../lib/format';
import ProductCard from '../components/ProductCard';
import { Spinner } from '../components/ui';

const perks = [
  { icon: Truck, title: 'Free shipping', desc: 'On orders over $150' },
  { icon: ShieldCheck, title: '2-year warranty', desc: 'On every build' },
  { icon: Sparkles, title: 'Curated catalog', desc: 'Only the good stuff' },
  { icon: Headphones, title: 'Enthusiast support', desc: 'We actually type' },
];

export default function Home() {
  const { data: featured, isLoading } = useFeatured();
  const { data: cats } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-wide grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge bg-accent/15 text-accent-soft">New · KEYCULT No. 2/65</span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
              Keyboards built to be <span className="text-gradient">obsessed</span> over.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-400">
              Premium mechanical keyboards, artisan keycaps, and tactile switches — engineered for the
              sound, the feel, and the ritual of typing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop all <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=KEYBOARD" className="btn-ghost">
                Explore keyboards
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-ink-850">
              <img
                src="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1100&q=80"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/1100x825/0f0f11/7c5cff/png?text=KEYCULT&font=montserrat';
                }}
                alt="Featured keyboard"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="card absolute -bottom-5 -left-5 hidden px-5 py-4 shadow-2xl sm:block">
              <p className="text-xs text-zinc-500">Starting at</p>
              <p className="font-display text-xl font-bold text-white">$99</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="container-wide grid grid-cols-2 gap-4 md:grid-cols-4">
        {perks.map((p) => (
          <div key={p.title} className="card flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-soft">
              <p.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <p className="text-xs text-zinc-500">{p.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="container-wide mt-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Shop by category</h2>
          <Link to="/shop" className="text-sm text-accent-soft hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {(cats?.categories ?? []).map((c) => (
            <Link
              key={c.category}
              to={`/shop?category=${c.category}`}
              className="card group flex flex-col items-center justify-center gap-1 px-4 py-8 text-center transition hover:border-accent/40"
            >
              <span className="font-display text-base font-semibold text-white group-hover:text-accent-soft">
                {categoryLabel(c.category)}
              </span>
              <span className="text-xs text-zinc-500">{c.count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-wide mt-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Featured</h2>
            <p className="text-sm text-zinc-500">Hand-picked by the KEYCULT team</p>
          </div>
          <Link to="/shop" className="text-sm text-accent-soft hover:underline">
            See more
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7 text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(featured?.products ?? []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-wide mt-24">
        <div className="card relative overflow-hidden px-8 py-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white">Find your endgame board.</h2>
            <p className="mx-auto mt-3 max-w-md text-zinc-400">
              From budget builds to flagship aluminum, there's a KEYCULT for every desk.
            </p>
            <Link to="/shop" className="btn-primary mt-7">
              Start shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
