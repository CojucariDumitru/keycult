import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatMoney, categoryLabel, discountPercent, cn } from '../lib/format';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useToast } from '../store/toast';
import ProductImage from './ProductImage';
import { Rating } from './ui';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.items.some((i) => i.id === product.id));

  const discount = discountPercent(product.price, product.oldPrice);
  const soldOut = product.stock === 0;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    push(`${product.name} added to cart`);
  };
  const onWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product);
    push(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-pop"
      >
        <div className="relative aspect-square overflow-hidden bg-white p-4">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            name={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {discount > 0 && <span className="badge bg-deal text-white">-{discount}%</span>}
            {product.featured && !discount && (
              <span className="badge bg-brand/10 text-brand">Top pick</span>
            )}
            {soldOut && <span className="badge bg-fg/70 text-canvas">Sold out</span>}
          </div>
          <button
            onClick={onWish}
            aria-label="Toggle wishlist"
            className={cn(
              'absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/90 backdrop-blur transition',
              wished ? 'text-deal' : 'text-muted hover:text-deal'
            )}
          >
            <Heart size={16} className={wished ? 'fill-deal' : ''} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
              {categoryLabel(product.category)}
            </span>
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-fg">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <p className="text-lg font-extrabold text-fg">{formatMoney(product.price)}</p>
              {product.oldPrice && product.oldPrice > product.price && (
                <p className="text-xs text-muted line-through">{formatMoney(product.oldPrice)}</p>
              )}
            </div>
            <button
              onClick={onAdd}
              disabled={soldOut}
              aria-label="Add to cart"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg shadow-brand transition hover:bg-brand-dark active:scale-95 disabled:opacity-40"
            >
              {soldOut ? <Check size={16} /> : <ShoppingCart size={17} />}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
