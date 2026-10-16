import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, setQty, subtotal, clear } = useCart();
  const nav = useNavigate();
  if (items.length === 0) return (
    <div className="text-center py-16">
      <p className="mb-4">Your cart is empty.</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map(i => (
            <div key={i.product.id} className="card p-4 flex gap-4 items-center">
              <img src={i.product.image} alt={i.product.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{i.product.name}</div>
                <div className="text-gray-600">${i.product.price.toFixed(2)}</div>
              </div>
              <input type="number" min={1} value={i.qty} onChange={e => setQty(i.product.id, Number(e.target.value))} className="input w-16" />
              <div className="font-semibold w-20 text-right">${(i.product.price * i.qty).toFixed(2)}</div>
              <button onClick={() => removeItem(i.product.id)} className="text-red-600 hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <div className="card p-4 h-fit">
          <h2 className="font-semibold mb-3">Summary</h2>
          <div className="flex justify-between mb-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between mb-1"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
          <div className="flex justify-between mb-1"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-primary w-full mt-4" onClick={() => nav('/checkout')}>Checkout</button>
          <button className="btn btn-secondary w-full mt-2" onClick={clear}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
}