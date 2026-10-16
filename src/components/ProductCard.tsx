import { Link } from 'react-router-dom';
import type { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-xs text-gray-500">{product.category}</div>
        <Link to={`/products/${product.id}`} className="font-semibold hover:text-blue-600">{product.name}</Link>
        <div className="text-yellow-500 text-sm">★ {product.rating}</div>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>
      </div>
    </div>
  );
}