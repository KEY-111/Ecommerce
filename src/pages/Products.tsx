import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  useEffect(() => { apiGet('/products').then(setProducts).catch(() => {}); }, []);
  const categories = Array.from(new Set(products.map(p => p.category)));
  const filtered = products.filter(p =>
    (cat === 'All' || p.category === cat) &&
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input max-w-xs" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="input max-w-xs" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <p>No products found.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}