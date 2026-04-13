// Ariella Thirza Callista A0255876L

/**
 * Creates 200 test users for the login stress test and writes
 * their credentials to test.users.json for use with SharedArray.
 *
 * Run from project root before login stress test:
 *   node tests/stress/helpers/seed-test-users.js
 *
 * Cleanup after testing login stress test:
 *   node tests/stress/helpers/delete-test-users.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';  
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userModel from '../../../models/userModel.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOTAL_USERS = 400;
const PASSWORD = 'Password123!';
const ANSWER = 'loadtest';

await mongoose.connect(process.env.MONGO_URL);
console.log('Connected to MongoDB');

// Hash password once — reuse for all users (same password)
const hashedPassword = await bcrypt.hash(PASSWORD, 10);

const users = [];
const jsonUsers = []; // plain credentials for test.users.json

for (let i = 0; i < TOTAL_USERS; i++) {
  const email = `loadtest_user_${i}@loadtest.invalid`;
  users.push({
    name: `LoadTest User ${i}`,
    email,
    password: hashedPassword,
    phone: `+65${String(80000000 + i).padStart(8, '0')}`,
    address: `${i} Load Test Street, Singapore`,
    DOB: new Date('1990-01-01'),
    answer: ANSWER,
    role: 0,
  });
  jsonUsers.push({ email, password: PASSWORD });
}

// Insert all users in one batch operation
await userModel.insertMany(users, { ordered: false });
console.log(`Seeded ${TOTAL_USERS} test users`);

// Write credentials to test.users.json for k6 SharedArray
const outputPath = path.join(__dirname, 'test.users.json');
fs.writeFileSync(outputPath, JSON.stringify(jsonUsers, null, 2));
console.log(`Credentials written to ${outputPath}`);

await mongoose.disconnect();
console.log('Done');