/**
 * Jest backend test setup - CommonJS version for Jest setupFilesAfterEnv
 * 
 * Note: This file must be CommonJS (.cjs or in a CommonJS-compatible context)
 * because Jest runs setupFilesAfterEnv files in a Node.js context before ESM handlers are active.
 */

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_1234567890';

// These will be populated in beforeAll after dynamic imports complete
let userModel, orderModel, productModel, hashPassword, connectDB, mongoose, JWT;

/**
 * Initialize all dependencies asynchronously
 * Called once before all tests in beforeAll hook
 */
async function initTestDependencies() {
  if (userModel) return; // Already initialized
  
  try {
    userModel = (await import('./models/userModel.js')).default;
    orderModel = (await import('./models/orderModel.js')).default;
    productModel = (await import('./models/productModel.js')).default;
    hashPassword = (await import('./helpers/authHelper.js')).hashPassword;
    connectDB = (await import('./config/db.js')).default;
    mongoose = (await import('mongoose')).default;
    
    // Load JWT - use require since we're in CommonJS context
    JWT = require('jsonwebtoken');
  } catch (err) {
    console.error('Error initializing test dependencies:', err);
    throw err;
  }
}

// Create test fixtures object
global.testFixtures = {
  regularUser: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'test123456',
    phone: '555-1234',
    address: '123 Test Street',
    answer: 'test-answer',
    role: 0,
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    phone: '555-5678',
    address: '456 Admin Ave',
    answer: 'admin-answer',
    role: 1,
  },
  orderData: {
    status: 'Not Process',
    payment: { success: true },
  },
};

// Create test utils object with methods that use initialized dependencies
global.testUtils = {
  /**
   * Seed a test user and return user doc with ID and JWT token
   */
  async seedUser(userData = {}) {
    if (!userModel) await initTestDependencies();
    
    const merged = { ...global.testFixtures.regularUser, ...userData };
    const hashedPassword = await hashPassword(merged.password);
    const user = await userModel.create({
      ...merged,
      password: hashedPassword,
    });

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user: user.toObject(), token };
  },

  /**
   * Seed an admin user and return with token
   */
  async seedAdmin() {
    return global.testUtils.seedUser(global.testFixtures.adminUser);
  },

  /**
   * Seed a test product and return product doc
   */
  async seedProduct(productData = {}) {
    if (!userModel) await initTestDependencies();
    
    const defaults = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product for integration testing',
      price: 99.99,
      category: null,
      quantity: 10,
      photo: { data: Buffer.from(''), contentType: 'image/jpeg' },
    };
    const product = await productModel.create({ ...defaults, ...productData });
    return product.toObject();
  },

  /**
   * Seed a test order with optional products and buyer
   */
  async seedOrder(orderData = {}) {
    if (!userModel) await initTestDependencies();
    
    const defaults = { ...global.testFixtures.orderData };
    const order = await orderModel.create({ ...defaults, ...orderData });
    return order.toObject();
  },

  /**
   * Clear all test collections
   */
  async clearDatabase() {
    if (!userModel) await initTestDependencies();
    
    await userModel.deleteMany({});
    await orderModel.deleteMany({});
    await productModel.deleteMany({});
  },
};

/**
 * Global test hooks for database connection/cleanup
 */
beforeAll(async () => {
  // Initialize dependencies
  await initTestDependencies();
  
  // Connect to test database before any tests run
  await connectDB();
  // Small delay to ensure connection is ready
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  // Clear database after all tests complete
  try {
    if (userModel) {
      await global.testUtils.clearDatabase();
    }
  } catch (err) {
    console.error('Error clearing test database:', err);
  }
  // Close MongoDB connection
  if (mongoose) {
    await mongoose.disconnect();
  }
});

module.exports = {
  testFixtures: global.testFixtures,
  testUtils: global.testUtils,
};
