// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

/**
 * 
 * Removes all users created by the signup stress test.
 *
 * Run from project root:
 *   node tests/stress/helpers/delete-test-signups.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../../../models/userModel.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);
console.log('Connected to MongoDB');

const result = await userModel.deleteMany({
  email: { $regex: /^k6_[a-z0-9]+_\d+@loadtest\.invalid$/ }
});

console.log(`Deleted ${result.deletedCount} test signup users`);
await mongoose.disconnect();
console.log('Done');