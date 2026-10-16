import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [newAddr, setNewAddr] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { if (user) apiGet('/orders').then(setOrders).catch(() => {}); }, [user]);
  if (!user) return <div className="card p-6 text-center"><p className="mb-4">Please login.</p><Link to="/login" className="btn btn-primary">Login</Link></div>;
  const addresses = user.addresses || [];

  const save = (e: any) => {
    e.preventDefault();
    updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addAddr = (e: any) => {
    e.preventDefault();
    if (!newAddr.trim()) return;
    updateProfile({ addresses: [...addresses, newAddr.trim()] });
    setNewAddr('');
  };
  const removeAddr = (a: string) => {
    updateProfile({ addresses: addresses.filter(x => x !== a) });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-3">Profile</h2>
        <p className="text-gray-600 mb-3">{user.email}</p>
        <form onSubmit={save} className="flex flex-col gap-3">
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
          <button className="btn btn-primary w-fit">Save</button>
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
        </form>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Saved Addresses</h3>
          {addresses.length === 0 && <p className="text-sm text-gray-500">No saved addresses.</p>}
          <ul className="flex flex-col gap-2 mb-3">
            {addresses.map((a, idx) => (
              <li key={idx} className="flex justify-between items-center border rounded p-2 text-sm">
                <span>{a}</span>
                <button onClick={() => removeAddr(a)} className="text-red-600 text-xs">Remove</button>
              </li>
            ))}
          </ul>
          <form onSubmit={addAddr} className="flex gap-2">
            <input className="input" placeholder="Add new address" value={newAddr} onChange={e => setNewAddr(e.target.value)} />
            <button className="btn btn-secondary">Add</button>
          </form>
        </div>
        <button className="btn btn-danger mt-4" onClick={() => { logout(); }}>Logout</button>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-3">Order History</h2>
        {orders.length === 0 ? <p>No orders yet.</p> : (
          <div className="flex flex-col gap-3">
            {orders.map(o => (
              <div key={o.id} className="border rounded p-3">
                <div className="flex justify-between text-sm">
                  <Link to={`/order/${o.id}`} className="font-semibold text-blue-600">{o.id}</Link>
                  <span>{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-600">{o.items.length} items · ${o.total.toFixed(2)} · {o.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}