// Ariella Thirza Callista A0255876L

/**
 * 
 * Removes all orders created by the payment stress test.
 *
 * Run from project root after payment stress test:
 *   node tests/stress/helpers/delete-test-orders.js
 */ 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../../../models/userModel.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);

// Find the test user's ID
const user = await userModel.findOne({ email: 'cs4218@test.com' });

if (!user) {
  console.log('Test user not found');
  await mongoose.disconnect();
  process.exit(1);
}

const result = await mongoose.connection
  .collection('orders')
  .deleteMany({ buyer: user._id });

console.log(`Deleted ${result.deletedCount} test orders for ${user.email}`);
await mongoose.disconnect();