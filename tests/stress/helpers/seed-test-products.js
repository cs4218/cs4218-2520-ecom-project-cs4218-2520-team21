// Ariella Thirza Callista A0255876L

/**
 * Creates products for pagination for homepage browse stress test
 *
 * Run from project root before browse stress test:
 *   node tests/stress/helpers/seed-test-products.js
 *
 * Cleanup after stress testing browse:
 *   node tests/stress/helpers/delete-test-products.js
 */

import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import productModel from '../../../models/productModel.js'

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);

const categoryId = '66db427fdb0119d9234b27ed'; // electronics 

const products = Array.from({ length: 30 }, (_, i) => ({
  name: `Stress Test Product ${i}`,
  slug: slugify(`Stress Test Product ${i}`),
  description: 'Automated test data for load testing',
  price: Math.floor(Math.random() * 100) + 1,
  category: categoryId,
  quantity: 30,
  shipping: false,
  photo: {
    data: Buffer.from(''),
    contentType: 'image/jpeg',
  },
}));

await productModel.insertMany(products);
console.log(`Seeded ${products.length} products`);
await mongoose.disconnect();