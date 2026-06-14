import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../types';
import { useToast } from '../../store/toast';
import { Spinner } from '../../components/ui';

const CATEGORIES = ['PHONE', 'LAPTOP', 'AUDIO', 'TV', 'GAMING', 'SMART_HOME', 'WEARABLE', 'ACCESSORY'];

interface FormState {
  name: string; slug: string; brand: string; description: string;
  priceDollars: string; oldPriceDollars: string; category: string; images: string;
  stock: string; featured: boolean; rating: string; reviewCount: string; specs: string;
}

const empty: FormState = {
  name: '', slug: '', brand: '', description: '', priceDollars: '', oldPriceDollars: '',
  category: 'PHONE', images: '', stock: '0', featured: false, rating: '0', reviewCount: '0', specs: '',
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const push = useToast((s) => s.push);
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { product } = await api.get<{ product: Product }>(`/products/${id}`);
        setForm({
          name: product.name, slug: product.slug, brand: product.brand, description: product.description,
          priceDollars: (product.price / 100).toFixed(2),
          oldPriceDollars: product.oldPrice ? (product.oldPrice / 100).toFixed(2) : '',
          category: product.category, images: product.images.join('\n'),
          stock: String(product.stock), featured: product.featured,
          rating: String(product.rating), reviewCount: String(product.reviewCount),
          specs: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
        });
      } catch (err) {
        push((err as Error).message || 'Could not load product', 'error');
        navigate('/admin/products');
      } finally { setFetching(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const specs: Record<string, string> = {};
    form.specs.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    const payload = {
      name: form.name, slug: form.slug || slugify(form.name), brand: form.brand, description: form.description,
      price: Math.round(parseFloat(form.priceDollars || '0') * 100),
      oldPrice: form.oldPriceDollars ? Math.round(parseFloat(form.oldPriceDollars) * 100) : null,
      category: form.category,
      images: images.length ? images : ['https://placehold.co/800x800/eef0f6/5838f0/png?text=KEYCULT'],
      stock: parseInt(form.stock || '0', 10), featured: form.featured,
      rating: parseFloat(form.rating || '0'), reviewCount: parseInt(form.reviewCount || '0', 10),
      specs: Object.keys(specs).length ? specs : undefined,
    };
    try {
      if (isEdit) { await api.put(`/products/${id}`, payload); push('Product updated'); }
      else { await api.post('/products', payload); push('Product created'); }
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (err) {
      push((err as Error).message || 'Save failed', 'error');
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><Spinner className="h-7 w-7 text-brand" /></div>;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/products" className="mb-5 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ChevronLeft size={16} /> Back to products</Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-fg">{isEdit ? 'Edit product' : 'New product'}</h1>

      <form onSubmit={submit} className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Name</label>
            <input required value={form.name} onChange={(e) => { set('name', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)); }} className="input" /></div>
          <div><label className="label">Slug</label>
            <input required value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="input font-mono text-xs" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Brand</label><input required value={form.brand} onChange={(e) => set('brand', e.target.value)} className="input" /></div>
          <div><label className="label">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input cursor-pointer">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
        </div>
        <div><label className="label">Description</label>
          <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="input resize-none" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="label">Price (USD)</label><input required type="number" step="0.01" min="0" value={form.priceDollars} onChange={(e) => set('priceDollars', e.target.value)} className="input" /></div>
          <div><label className="label">Old price</label><input type="number" step="0.01" min="0" value={form.oldPriceDollars} onChange={(e) => set('oldPriceDollars', e.target.value)} className="input" placeholder="optional" /></div>
          <div><label className="label">Stock</label><input required type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input" /></div>
          <div><label className="label">Rating</label><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="input" /></div>
        </div>
        <div><label className="label">Image URLs (one per line)</label>
          <textarea rows={2} value={form.images} onChange={(e) => set('images', e.target.value)} className="input resize-none font-mono text-xs" placeholder="https://…" /></div>
        <div><label className="label">Specs (key: value, one per line)</label>
          <textarea rows={3} value={form.specs} onChange={(e) => set('specs', e.target.value)} className="input resize-none font-mono text-xs" placeholder="Display: 6.1 OLED" /></div>
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 rounded accent-brand" />
          <span className="text-sm text-fg">Featured product</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? <Spinner className="h-4 w-4" /> : isEdit ? 'Save changes' : 'Create product'}</button>
          <Link to="/admin/products" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
