import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">Shoply</Link>
        <nav className="flex items-center gap-4">
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <Link to="/cart" className="hover:text-blue-600 relative">
            Cart
            {count > 0 && <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{count}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-blue-600">{user.name}</Link>
              <button onClick={() => { logout(); nav('/'); }} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}