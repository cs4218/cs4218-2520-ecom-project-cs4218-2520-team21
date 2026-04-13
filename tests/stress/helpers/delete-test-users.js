// Ariella Thirza Callista A0255876L

/**
 * 
 * Removes all users seeded by seed-test-users.js for login stress test
 *
 * Run from project root:
 *   node tests/stress/helpers/delete-test-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../../../models/userModel.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);
console.log('Connected to MongoDB');

const result = await userModel.deleteMany({
  email: { $regex: /^loadtest_user_\d+@loadtest\.invalid$/ }
});

console.log(`Deleted ${result.deletedCount} test users`);
await mongoose.disconnect();
console.log('Done');