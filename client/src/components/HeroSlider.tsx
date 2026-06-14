import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Slide {
  eyebrow: string;
  title: string;
  highlight: string;
  text: string;
  cta: string;
  to: string;
  image: string;
  from: string;
  to2: string;
}

const slides: Slide[] = [
  {
    eyebrow: 'New · Apple',
    title: 'iPhone 15 Pro.',
    highlight: 'Titanium. So strong. So light.',
    text: 'The A17 Pro chip and a 48MP camera system. Now from $999.',
    cta: 'Shop iPhone',
    to: '/product/iphone-15-pro',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    from: '#4326c8',
    to2: '#7c63ff',
  },
  {
    eyebrow: 'Save up to 20%',
    title: 'Sound that disappears.',
    highlight: 'Noise-cancelling audio.',
    text: 'Sony, Bose, Apple & Sennheiser headphones on sale this week.',
    cta: 'Shop audio',
    to: '/shop?category=AUDIO',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    from: '#0f766e',
    to2: '#2dd4b2',
  },
  {
    eyebrow: 'Level up',
    title: 'Next-gen gaming.',
    highlight: 'PS5, Xbox & more.',
    text: 'Consoles, monitors and gear with free shipping over $99.',
    cta: 'Shop gaming',
    to: '/shop?category=GAMING',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80',
    from: '#9d174d',
    to2: '#fb7185',
  },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];

  return (
    <div
      className="relative h-[300px] overflow-hidden rounded-2xl md:h-[380px]"
      style={{ background: `linear-gradient(115deg, ${s.from}, ${s.to2})` }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 grid grid-cols-1 items-center md:grid-cols-2"
        >
          <div className="z-10 p-7 md:p-12">
            <span className="badge bg-white/20 text-white">{s.eyebrow}</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white md:text-5xl">
              {s.title}
            </h2>
            <p className="mt-1 font-display text-lg font-semibold text-white/90 md:text-2xl">
              {s.highlight}
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/80">{s.text}</p>
            <Link
              to={s.to}
              className="btn mt-6 bg-white text-fg hover:bg-white/90"
            >
              {s.cta} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 top-0 hidden w-1/2 md:block">
            <img
              src={s.image}
              alt=""
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              className="h-full w-full object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent,black_30%)]"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 left-7 z-20 flex gap-2 md:left-12">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
