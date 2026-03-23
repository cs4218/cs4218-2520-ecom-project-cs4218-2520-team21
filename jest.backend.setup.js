const bufferMod = require('buffer');
if (!bufferMod.SlowBuffer) {
  // Compatibility for Node versions where SlowBuffer is removed.
  bufferMod.SlowBuffer = bufferMod.Buffer;
}

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userModel = require('./models/userModel.js').default;
const orderModel = require('./models/orderModel.js').default;
const productModel = require('./models/productModel.js').default;
const categoryModel = require('./models/categoryModel.js').default;
const { hashPassword } = require('./helpers/authHelper.js');
const JWT = require('jsonwebtoken');

let mongoServer;

jest.setTimeout(30000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_1234567890';

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

global.testUtils = {
  async seedUser(userData = {}) {
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

  async seedAdmin() {
    return global.testUtils.seedUser(global.testFixtures.adminUser);
  },

  async seedProduct(productData = {}) {
    const category = await categoryModel.create({
      name: 'Test Category',
      slug: `test-category-${Date.now()}`,
    });

    const defaults = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product for integration testing',
      price: 99.99,
      category: category._id,
      quantity: 10,
      photo: { data: Buffer.from(''), contentType: 'image/jpeg' },
    };
    const product = await productModel.create({ ...defaults, ...productData });
    return product.toObject();
  },

  async seedOrder(orderData = {}) {
    const defaults = { ...global.testFixtures.orderData };
    const order = await orderModel.create({ ...defaults, ...orderData });
    return order.toObject();
  },

  async clearDatabase() {
    await userModel.deleteMany({});
    await orderModel.deleteMany({});
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});
  },
};

beforeAll(async () => {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGO_URL) {
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGO_URL = mongoServer.getUri();
    }
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
});

afterAll(async () => {
  try {
    await global.testUtils.clearDatabase();
  } catch (err) {
    console.error('Error clearing test database:', err);
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
