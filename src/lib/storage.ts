const USERS_KEY = 'ecom_users';
const SESSION_KEY = 'ecom_session';
const CART_KEY = 'ecom_cart';
const ORDERS_KEY = 'ecom_orders';

export function loadUsers(): any[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
export function saveUsers(users: any[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export function getSession(): string | null { return localStorage.getItem(SESSION_KEY); }
export function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId); else localStorage.removeItem(SESSION_KEY);
}

export function loadCart(): any[] { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
export function saveCart(cart: any[]) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

export function loadOrders(): any[] { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch { return []; } }
export function saveOrders(orders: any[]) { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }