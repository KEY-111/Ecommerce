import type { Product } from '../types';

export const products: Product[] = [
  { id: 'p1', name: 'Wireless Headphones', price: 79.99, description: 'Comfortable over-ear wireless headphones with noise cancellation and 30h battery life.', image: 'https://picsum.photos/seed/headphones/400/300', category: 'Electronics', stock: 25, rating: 4.5 },
  { id: 'p2', name: 'Smart Watch', price: 199.99, description: 'Fitness tracking smart watch with heart rate monitor and GPS.', image: 'https://picsum.photos/seed/watch/400/300', category: 'Electronics', stock: 15, rating: 4.7 },
  { id: 'p3', name: 'Running Shoes', price: 89.50, description: 'Lightweight breathable running shoes for daily training.', image: 'https://picsum.photos/seed/shoes/400/300', category: 'Apparel', stock: 40, rating: 4.3 },
  { id: 'p4', name: 'Backpack', price: 59.99, description: 'Durable 30L backpack with laptop compartment.', image: 'https://picsum.photos/seed/backpack/400/300', category: 'Accessories', stock: 60, rating: 4.6 },
  { id: 'p5', name: 'Coffee Maker', price: 129.00, description: 'Programmable drip coffee maker, 12 cups.', image: 'https://picsum.photos/seed/coffee/400/300', category: 'Home', stock: 20, rating: 4.2 },
  { id: 'p6', name: 'Yoga Mat', price: 29.99, description: 'Non-slip eco-friendly yoga mat, 6mm.', image: 'https://picsum.photos/seed/yoga/400/300', category: 'Fitness', stock: 80, rating: 4.4 },
  { id: 'p7', name: 'Desk Lamp', price: 34.99, description: 'Adjustable LED desk lamp with touch control.', image: 'https://picsum.photos/seed/lamp/400/300', category: 'Home', stock: 35, rating: 4.1 },
  { id: 'p8', name: 'Bluetooth Speaker', price: 49.99, description: 'Portable waterproof Bluetooth speaker.', image: 'https://picsum.photos/seed/speaker/400/300', category: 'Electronics', stock: 50, rating: 4.5 },
  { id: 'p9', name: 'T-Shirt Pack', price: 24.99, description: 'Pack of 3 cotton t-shirts.', image: 'https://picsum.photos/seed/tshirt/400/300', category: 'Apparel', stock: 100, rating: 4.0 },
  { id: 'p10', name: 'Water Bottle', price: 19.99, description: 'Insulated stainless steel water bottle, 750ml.', image: 'https://picsum.photos/seed/bottle/400/300', category: 'Accessories', stock: 120, rating: 4.8 },
  { id: 'p11', name: 'Blender', price: 69.99, description: 'High-speed blender for smoothies and soups.', image: 'https://picsum.photos/seed/blender/400/300', category: 'Home', stock: 18, rating: 4.3 },
  { id: 'p12', name: 'Dumbbells Set', price: 149.99, description: 'Adjustable dumbbells set, 5-52.5 lbs.', image: 'https://picsum.photos/seed/dumbbells/400/300', category: 'Fitness', stock: 12, rating: 4.7 },
];

export const categories = Array.from(new Set(products.map(p => p.category)));