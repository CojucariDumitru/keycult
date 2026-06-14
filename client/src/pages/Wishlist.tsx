import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../store/wishlist';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/ui';

export default function Wishlist() {
  const items = useWishlist((s) => s.items);

  return (
    <div className="container-wide py-10">
      <h1 className="mb-2 flex items-center gap-2 font-display text-2xl font-extrabold text-fg md:text-3xl">
        <Heart className="text-deal" /> Wishlist
      </h1>
      <p className="mb-8 text-sm text-muted">{items.length} saved item(s)</p>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          subtitle="Tap the heart on any product to save it for later."
          action={<Link to="/shop" className="btn-primary mt-2">Browse products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
