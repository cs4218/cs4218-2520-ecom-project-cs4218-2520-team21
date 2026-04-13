// Ariella Thirza Callista A0255876L

/**
 * 
 * Removes all orders products seeded in db for the browse stress test.
 *
 * Run from project root after browse stress test:
 *   node tests/stress/helpers/delete-test-products.js
 */ 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from '../../../models/productModel.js'

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);

const result = await productModel.deleteMany({
  name: { $regex: /^Stress Test Product/ }
});

console.log(`Deleted ${result.deletedCount} test products`);
await mongoose.disconnect();