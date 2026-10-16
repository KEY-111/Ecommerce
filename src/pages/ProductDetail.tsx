import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiGet, apiPost } from '../lib/api';
import type { Product } from '../types';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [qty, setQty] = useState(1);
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    apiGet('/products/' + id).then(setP).catch(() => {});
    apiGet('/products/' + id + '/reviews').then(setReviews).catch(() => {});
  }, [id]);

  if (!p) return <p>Loading...</p>;

  const submitReview = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    await apiPost('/products/' + p.id + '/reviews', { userId: user.id, userName: user.name, rating, comment });
    const r = await apiGet('/products/' + p.id + '/reviews');
    setReviews(r);
    setComment('');
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        <img src={p.image} alt={p.name} className="w-full h-80 object-cover rounded-lg" />
        <div>
          <div className="text-sm text-gray-500">{p.category}</div>
          <h1 className="text-3xl font-bold mt-1">{p.name}</h1>
          <div className="text-yellow-500 my-2">★ {p.rating}</div>
          <div className="text-2xl font-bold text-blue-600 mb-4">${p.price.toFixed(2)}</div>
          <p className="text-gray-700 mb-4">{p.description}</p>
          <p className="text-sm text-gray-500 mb-4">In stock: {p.stock}</p>
          <div className="flex items-center gap-3 mb-4">
            <label>Qty</label>
            <input type="number" min={1} max={p.stock} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} className="input w-20" />
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => addItem(p, qty)}>Add to Cart</button>
            <button className="btn btn-secondary" onClick={() => { addItem(p, qty); nav('/cart'); }}>Buy Now</button>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-xl font-bold mb-3">Reviews</h2>
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
        {reviews.map((r: any) => (
          <div key={r.id} className="border-b py-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{r.user_name || 'User'}</span>
              <span className="text-yellow-500">★ {r.rating}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
          </div>
        ))}
        {user ? (
          <form onSubmit={submitReview} className="mt-4 flex flex-col gap-3">
            <select className="input w-32" value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <textarea className="input" rows={3} placeholder="Write a review..." value={comment} onChange={e => setComment(e.target.value)} required />
            <button className="btn btn-primary w-fit">Submit Review</button>
          </form>
        ) : (
          <p className="mt-3 text-sm"><Link to="/login" className="text-blue-600">Login</Link> to write a review.</p>
        )}
      </div>
    </div>
  );
}