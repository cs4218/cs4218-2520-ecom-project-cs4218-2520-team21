// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Category from '../../models/categoryModel.js';
import Product from '../../models/productModel.js';

import {
  getSingleProductController,
  relatedProductController,
  productPhotoController,
} from '../../controllers/productController.js';

// App setup
// M3 — Express routes wired to controllers
// M5 — MongoDB via MongoMemoryServer

const app = express();
app.use(express.json());

app.get('/api/v1/product/get-product/:slug', getSingleProductController); // M3
app.get('/api/v1/product/related-product/:pid/:cid', relatedProductController);  // M3
app.get('/api/v1/product/product-photo/:pid', productPhotoController);  // M3

// Setup

let mongoServer;
let clothing, tshirt, whiteshirt;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // M5
  await mongoose.connect(mongoServer.getUri());
}, 30000);

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});

  // Seed M6 with known test data
  clothing = await Category.create({ name: 'Clothing', slug: 'clothing' });

  tshirt = await Product.create({
    name: 'NUS T-shirt',
    slug: 'nus-t-shirt',
    price: 4.99,
    description: 'Plain NUS T-shirt',
    category: clothing._id,
    quantity: 10,
    photo: {
      data: Buffer.from('fake-image'),
      contentType: 'image/jpeg',
    },
  });

  whiteshirt = await Product.create({
    name: 'White Shirt',
    slug: 'white-shirt',
    price: 20.00,
    description: 'White Shirt',
    category: clothing._id,
    quantity: 5,
    photo: {
      data: Buffer.from('fake-image-2'),
      contentType: 'image/jpeg',
    },
  });
}, 10000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

// ProductDetails Page Integration Tests - Step 3 (Bottom-Up): Test axios (M3) and MongoDB (M5) 
describe('ProductDetails Page Integration Tests - Step 3 (Bottom-Up): Test axios/API (M3) and MongoDB (M5) ', () => {
  test('M3+M5: GET /get-product returns correct product from M5', async () => {
    const res = await request(app)
      .get('/api/v1/product/get-product/nus-t-shirt');

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('NUS T-shirt');
    expect(res.body.product.price).toBe(4.99);
    expect(res.body.product.description).toBe('Plain NUS T-shirt');
    expect(res.body.product.category.name).toBe('Clothing');
  });

  test('M3+M5: GET /get-product returns 404 for non-existent slug in M5', async () => {
    const res = await request(app)
      .get('/api/v1/product/get-product/does-not-exist');

    expect(res.status).toBe(404);
  });

  test('M3+M5: GET /related-product returns products in same category from M5', async () => {
    const res = await request(app)
      .get(`/api/v1/product/related-product/${tshirt._id}/${clothing._id}`);

    expect(res.status).toBe(200);
    expect(res.body.products.map(p => p.name)).toContain('White Shirt');
    expect(res.body.products.map(p => p.name)).not.toContain('NUS T-shirt');
  });

  test('M3+M5: GET /related-product returns empty when no related products in M5', async () => {
    // Remove White Shirt from M6 so NUS T-shirt has no related products
    await Product.deleteOne({ slug: 'white-shirt' });

    const res = await request(app)
      .get(`/api/v1/product/related-product/${tshirt._id}/${clothing._id}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  test('M3+M5: GET /product-photo returns image data stored in M5', async () => {
    const res = await request(app)
      .get(`/api/v1/product/product-photo/${tshirt._id}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  test('M3+M5: GET /product-photo returns 404 for non-existent product in M5', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/product/product-photo/${fakeId}`);

    expect(res.status).toBe(404);
  });

  test('M3+M5: get-product + related-product + product-photo all return consistent data', async () => {
    // Simulate what M1 ProductDetails does on mount
    // calls all 3 M3 endpoints in sequence using data from the previous call

    // Step 1: M3 get-product -> M6
    const productRes = await request(app)
      .get('/api/v1/product/get-product/nus-t-shirt');

    expect(productRes.status).toBe(200);
    const { _id: pid, category } = productRes.body.product;

    // Step 2: M3 related-product -> M6 using IDs returned from step 1
    const relatedRes = await request(app)
      .get(`/api/v1/product/related-product/${pid}/${category._id}`);

    expect(relatedRes.status).toBe(200);

    // Step 3: M3 product-photo -> M6 using pid from step 1
    const photoRes = await request(app)
      .get(`/api/v1/product/product-photo/${pid}`);

    expect(photoRes.status).toBe(200);

    // All related products returned by M3 belong to same category in M6
    relatedRes.body.products.forEach(p => {
      expect(p.category._id.toString()).toBe(category._id.toString());
    });

    // Photo content-type from M6 matches what was seeded
    expect(photoRes.headers['content-type']).toMatch(/image\/jpeg/);
  });
});