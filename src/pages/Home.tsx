import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { apiGet('/products').then(setProducts).catch(() => {}); }, []);
  const featured = products.slice(0, 4);
  return (
    <div>
      <section className="bg-blue-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Shoply</h1>
        <p className="mb-4">Discover great products at great prices.</p>
        <Link to="/products" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium">Shop Now</Link>
      </section>
      <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {featured.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}