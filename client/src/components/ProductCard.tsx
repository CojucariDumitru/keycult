import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { formatMoney, categoryLabel } from '../lib/format';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';
import ProductImage from './ProductImage';
import { Rating } from './ui';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    push(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="card block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-ink-850">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            name={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.featured && (
              <span className="badge bg-accent/90 text-white">Featured</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-rose-500/90 text-white">Sold out</span>
            )}
            {product.stock > 0 && product.stock <= 6 && (
              <span className="badge bg-amber-500/90 text-black">Low stock</span>
            )}
          </div>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 hover:bg-accent hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
        <div className="space-y-1.5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-accent-soft">
              {categoryLabel(product.category)}
            </span>
            <Rating value={product.rating} />
          </div>
          <h3 className="truncate font-display text-base font-semibold text-white">
            {product.name}
          </h3>
          <p className="truncate text-xs text-zinc-500">{product.brand}</p>
          <p className="pt-1 font-semibold text-white">{formatMoney(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
