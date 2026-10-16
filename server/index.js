import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'store.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    addresses TEXT NOT NULL DEFAULT '[]',
    token TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    category TEXT,
    stock INTEGER,
    rating REAL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_last4 TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const userCols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
if (!userCols.includes('token')) db.exec('ALTER TABLE users ADD COLUMN token TEXT');

const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (count === 0) {
  const seed = [
    ['p1','Wireless Headphones',79.99,'Comfortable over-ear wireless headphones with noise cancellation and 30h battery life.','https://picsum.photos/seed/headphones/400/300','Electronics',25,4.5],
    ['p2','Smart Watch',199.99,'Fitness tracking smart watch with heart rate monitor and GPS.','https://picsum.photos/seed/watch/400/300','Electronics',15,4.7],
    ['p3','Running Shoes',89.50,'Lightweight breathable running shoes for daily training.','https://picsum.photos/seed/shoes/400/300','Apparel',40,4.3],
    ['p4','Backpack',59.99,'Durable 30L backpack with laptop compartment.','https://picsum.photos/seed/backpack/400/300','Accessories',60,4.6],
    ['p5','Coffee Maker',129.00,'Programmable drip coffee maker, 12 cups.','https://picsum.photos/seed/coffee/400/300','Home',20,4.2],
    ['p6','Yoga Mat',29.99,'Non-slip eco-friendly yoga mat, 6mm.','https://picsum.photos/seed/yoga/400/300','Fitness',80,4.4],
    ['p7','Desk Lamp',34.99,'Adjustable LED desk lamp with touch control.','https://picsum.photos/seed/lamp/400/300','Home',35,4.1],
    ['p8','Bluetooth Speaker',49.99,'Portable waterproof Bluetooth speaker.','https://picsum.photos/seed/speaker/400/300','Electronics',50,4.5],
    ['p9','T-Shirt Pack',24.99,'Pack of 3 cotton t-shirts.','https://picsum.photos/seed/tshirt/400/300','Apparel',100,4.0],
    ['p10','Water Bottle',19.99,'Insulated stainless steel water bottle, 750ml.','https://picsum.photos/seed/bottle/400/300','Accessories',120,4.8],
    ['p11','Blender',69.99,'High-speed blender for smoothies and soups.','https://picsum.photos/seed/blender/400/300','Home',18,4.3],
    ['p12','Dumbbells Set',149.99,'Adjustable dumbbells set, 5-52.5 lbs.','https://picsum.photos/seed/dumbbells/400/300','Fitness',12,4.7],
  ];
  const stmt = db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,?)');
  for (const p of seed) stmt.run(...p);
}

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}
function verifyPasswordHash(pw, stored) {
  if (!stored) return false;
  if (!stored.startsWith('scrypt:')) return stored === pw; // legacy plaintext
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  const [, salt, hash] = parts;
  const calc = crypto.scryptSync(pw, salt, 64).toString('hex');
  try { return crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(hash, 'hex')); }
  catch { return false; }
}
function issueToken() { return crypto.randomBytes(32).toString('hex'); }
function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, addresses: JSON.parse(row.addresses || '[]') };
}
function sanitize(s) { return String(s || '').replace(/<[^>]*>/g, ''); }

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const row = db.prepare('SELECT id,name,email,addresses,token FROM users WHERE token=?').get(token);
  if (!row) return res.status(401).json({ error: 'Unauthorized' });
  row.addresses = JSON.parse(row.addresses || '[]');
  req.user = row;
  next();
}

const app = express();
app.get('/', (req, res) => res.json({ status: 'ok', api: 'ecommerce', message: 'Use /api/* endpoints' }));
app.use(cors());
app.use(express.json());

// auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const exists = db.prepare('SELECT id FROM users WHERE lower(email)=lower(?)').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const id = 'u_' + Date.now();
  const token = issueToken();
  db.prepare('INSERT INTO users (id,name,email,password,addresses,token) VALUES (?,?,?,?,?,?)')
    .run(id, name, email, hashPassword(password), '[]', token);
  res.status(201).json({ ...publicUser({ id, name, email, addresses: '[]' }), token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM users WHERE lower(email)=lower(?)').get(email);
  if (!row || !verifyPasswordHash(password, row.password)) return res.status(401).json({ error: 'Invalid email or password' });
  // upgrade legacy plaintext if needed
  if (!row.password.startsWith('scrypt:')) {
    db.prepare('UPDATE users SET password=? WHERE id=?').run(hashPassword(password), row.id);
  }
  const token = issueToken();
  db.prepare('UPDATE users SET token=? WHERE id=?').run(token, row.id);
  res.json({ ...publicUser(row), token });
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

app.post('/api/auth/verify', requireAuth, (req, res) => {
  const { password } = req.body || {};
  const row = db.prepare('SELECT password FROM users WHERE id=?').get(req.user.id);
  const ok = verifyPasswordHash(password, row.password);
  res.json({ ok });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET token=NULL WHERE id=?').run(req.user.id);
  res.json({ ok: true });
});

// users
app.get('/api/users/:id', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const row = db.prepare('SELECT id,name,email,addresses FROM users WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  row.addresses = JSON.parse(row.addresses || '[]');
  res.json(row);
});

app.put('/api/users/:id', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const { name, addresses } = req.body || {};
  if (name !== undefined) db.prepare('UPDATE users SET name=? WHERE id=?').run(name, req.params.id);
  if (addresses !== undefined) db.prepare('UPDATE users SET addresses=? WHERE id=?').run(JSON.stringify(addresses), req.params.id);
  const row = db.prepare('SELECT id,name,email,addresses FROM users WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  row.addresses = JSON.parse(row.addresses || '[]');
  res.json(row);
});

// products
app.get('/api/products', (req, res) => res.json(db.prepare('SELECT * FROM products').all()));
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// reviews
app.get('/api/products/:id/reviews', (req, res) => {
  res.json(db.prepare('SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC').all(req.params.id));
});
app.post('/api/products/:id/reviews', requireAuth, (req, res) => {
  const { rating, comment } = req.body || {};
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'Invalid rating' });
  const id = 'r_' + Date.now();
  db.prepare('INSERT INTO reviews (id,product_id,user_id,user_name,rating,comment,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.params.id, req.user.id, req.user.name, r, sanitize(comment), new Date().toISOString());
  res.status(201).json(db.prepare('SELECT * FROM reviews WHERE id=?').get(id));
});

// orders
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, shippingAddress, newAddress, paymentLast4 } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Empty order' });
  const normalized = [];
  let subtotal = 0;
  for (const it of items) {
    const product = db.prepare('SELECT * FROM products WHERE id=?').get(it.productId);
    if (!product) return res.status(400).json({ error: 'Unknown product' });
    const qty = Number(it.qty);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'Invalid qty' });
    subtotal += product.price * qty;
    normalized.push({ productId: product.id, name: product.name, price: product.price, qty, image: product.image });
  }
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const address = (newAddress || shippingAddress || '').toString().trim();
  if (!address) return res.status(400).json({ error: 'Address required' });

  // append new address to user if not present
  if (newAddress && !req.user.addresses.includes(address)) {
    const updated = [...req.user.addresses, address];
    db.prepare('UPDATE users SET addresses=? WHERE id=?').run(JSON.stringify(updated), req.user.id);
  }

  const orderId = 'ORD-' + Date.now();
  db.prepare('INSERT INTO orders (id,user_id,items,subtotal,shipping,tax,total,shipping_address,payment_last4,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(orderId, req.user.id, JSON.stringify(normalized), subtotal, shipping, tax, total, address, String(paymentLast4 || '').slice(-4), 'Paid', new Date().toISOString());
  const order = db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
  order.items = JSON.parse(order.items);
  res.status(201).json(order);
});

app.get('/api/orders', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  for (const r of rows) r.items = JSON.parse(r.items);
  res.json(rows);
});
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  row.items = JSON.parse(row.items);
  res.json(row);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('API on http://localhost:' + PORT));
