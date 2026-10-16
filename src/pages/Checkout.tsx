import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  if (!user) return <div className="card p-6 text-center"><p className="mb-4">Please login to checkout.</p><Link to="/login" className="btn btn-primary">Login</Link></div>;
  if (items.length === 0) return <div className="card p-6 text-center"><p className="mb-4">Cart is empty.</p><Link to="/products" className="btn btn-primary">Shop</Link></div>;

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-3">Review Order</h2>
        <p className="text-gray-600 mb-4">You will be redirected to the payment page to verify your identity and choose a delivery address.</p>
        <Link to="/payment" className="btn btn-primary">Proceed to Payment</Link>
      </div>
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