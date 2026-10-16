import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiPost } from '../lib/api';

export default function Payment() {
  const { user, verifyPassword } = useAuth();
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [verifyErr, setVerifyErr] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [useNew, setUseNew] = useState((user?.addresses?.length || 0) === 0);
  const [selected, setSelected] = useState<string | null>(user?.addresses?.[0] || null);
  const [newAddress, setNewAddress] = useState('');
  const [card, setCard] = useState('');
  const [err, setErr] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!user) return <div className="card p-6 text-center"><p className="mb-4">Please login.</p><Link to="/login" className="btn btn-primary">Login</Link></div>;
  if (items.length === 0) return <div className="card p-6 text-center"><p className="mb-4">Cart is empty.</p><Link to="/products" className="btn btn-primary">Shop</Link></div>;

  const addresses = user.addresses || [];
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const verify = async (e: any) => {
    e.preventDefault();
    const ok = await verifyPassword(password);
    if (!ok) { setVerifyErr('Incorrect password'); return; }
    setVerifyErr('');
    setUnlocked(true);
  };

  const pay = async (e: any) => {
    e.preventDefault();
    const address = useNew ? newAddress.trim() : (selected || '');
    if (!address) { setErr('Select or enter a delivery address'); return; }
    if (!/^\d{13,19}$/.test(card.replace(/\s/g, ''))) { setErr('Enter valid card number (13-19 digits)'); return; }
    setErr('');
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const order = await apiPost('/orders', {
      items: items.map(i => ({ productId: i.product.id, qty: i.qty })),
      shippingAddress: useNew ? undefined : address,
      newAddress: useNew ? address : undefined,
      paymentLast4: card.replace(/\s/g, '').slice(-4),
    });
    clear();
    setProcessing(false);
    nav(`/order/${order.id}`);
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto card p-6">
        <h2 className="text-xl font-bold mb-3">Verify Identity</h2>
        <p className="text-gray-600 mb-4">Enter your password to fetch your saved delivery addresses.</p>
        {verifyErr && <p className="text-red-600 mb-2">{verifyErr}</p>}
        <form onSubmit={verify} className="flex flex-col gap-3">
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-primary">Verify & Fetch Addresses</button>
        </form>
        <Link to="/checkout" className="btn btn-secondary mt-3">Back</Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={pay} className="card p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Payment</h2>
        {err && <p className="text-red-600">{err}</p>}

        <label className="font-medium">Delivery Address</label>
        {addresses.length > 0 && (
          <div className="flex flex-col gap-2">
            {addresses.map((a, idx) => (
              <label key={idx} className="flex items-start gap-2 border rounded p-2 cursor-pointer">
                <input type="radio" name="addr" checked={!useNew && selected === a} onChange={() => { setUseNew(false); setSelected(a); }} />
                <span>{a}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer">
              <input type="radio" name="addr" checked={useNew} onChange={() => setUseNew(true)} />
              <span>Enter new address</span>
            </label>
          </div>
        )}
        {useNew && (
          <textarea className="input" rows={3} placeholder="Enter delivery address" value={newAddress} onChange={e => setNewAddress(e.target.value)} required />
        )}

        <label className="font-medium">Card Number (mock)</label>
        <input className="input" placeholder="4242 4242 4242 4242" value={card} onChange={e => setCard(e.target.value)} required />

        <button className="btn btn-primary" disabled={processing}>{processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}</button>
      </form>
      <div className="card p-6 h-fit">
        <h2 className="text-xl font-bold mb-3">Order Summary</h2>
        {items.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm mb-1">
            <span>{i.product.name} x{i.qty}</span>
            <span>${(i.product.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}