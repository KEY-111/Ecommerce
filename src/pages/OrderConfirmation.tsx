import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../lib/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    apiGet('/orders/' + id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found or unauthorized.</p>;
  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
      <p className="mb-4">Thank you. Your order <b>{order.id}</b> has been placed.</p>
      <div className="mb-2">Status: {order.status}</div>
      <div className="mb-2">Total: ${order.total.toFixed(2)}</div>
      <div className="mb-4">Paid with card ending {order.payment_last4 || order.paymentLast4}</div>
      <h2 className="font-semibold mb-2">Items</h2>
      {order.items.map((i: any, idx: number) => (
        <div key={idx} className="flex justify-between text-sm mb-1">
          <span>{i.name} x{i.qty}</span><span>${(i.price * i.qty).toFixed(2)}</span>
        </div>
      ))}
      <div className="mt-4 flex gap-3">
        <Link to="/profile" className="btn btn-primary">View Orders</Link>
        <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}