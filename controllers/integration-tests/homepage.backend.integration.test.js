// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Category from '../../models/categoryModel.js';
import Product from '../../models/productModel.js';

import { categoryControlller } from '../../controllers/categoryController.js';
import {
  getProductController,
  productCountController,
  productListController,
  productFiltersController,
  productPhotoController,
} from '../../controllers/productController.js';

// App setup
// M3 — Express routes wired to controllers
// M6 — MongoDB via MongoMemoryServer

const app = express();
app.use(express.json());

app.get('/api/v1/category/get-category', categoryControlller); 
app.get('/api/v1/product/product-count', productCountController);
app.get('/api/v1/product/product-list/:page', productListController);
app.post('/api/v1/product/product-filters', productFiltersController);
app.get('/api/v1/product/product-photo/:pid', productPhotoController);

// Setup 
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});

  const clothing = await Category.create({ name: 'Clothing', slug: 'clothing' });
  const electronics = await Category.create({ name: 'Electronics', slug: 'electronics' });

  await Product.create([
    { name: 'NUS T-shirt', price: 4.99, category: clothing._id, description: 'T-shirt', slug: 'nus-t-shirt', quantity: 10 },
    { name: 'White Shirt', price: 20.00, category: clothing._id, description: 'Shirt', slug: 'white-shirt', quantity: 5  },
    { name: 'Dyson', price: 899, category: electronics._id, description: 'Vacuum', slug: 'dyson', quantity: 3  },
  ]);
}, 10000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

// HomePage Integration Tests -- Step 3 (Bottom-Up): Cluster API (M4) and MongoDB (M6) and test
describe('HomePage Integration Tests -- Step 3 (Bottom-Up): Cluster API (M4) and MongoDB (M6) and test', () => {
  test('M4+M6: GET /get-category returns all categories from DB', async () => {
    const res = await request(app).get('/api/v1/category/get-category');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category).toHaveLength(2);
    expect(res.body.category.map(c => c.name)).toContain('Clothing');
    expect(res.body.category.map(c => c.name)).toContain('Electronics');
  });

  test('M4+M6: GET /product-count returns correct total from DB', async () => {
    const res = await request(app).get('/api/v1/product/product-count');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
  });

  test('M4+M6: GET /product-list/1 returns products from DB', async () => {
    const res = await request(app).get('/api/v1/product/product-list/1');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    res.body.products.forEach(p => {
      expect(p.name).toBeDefined();
      expect(p.price).toBeDefined();
    });
  });

  test('M4+M6: POST /product-filters filters by category using real DB IDs', async () => {
    const catRes = await request(app).get('/api/v1/category/get-category');
    const clothingId = catRes.body.category.find(c => c.name === 'Clothing')._id;

    const res = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [clothingId], radio: [] });

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    res.body.products.forEach(p => {
      expect(['NUS T-shirt', 'White Shirt']).toContain(p.name);
    });
  });

  test('M4+M6: POST /product-filters filters by price range from real DB', async () => {
    const res = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [], radio: [0, 19] });

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('NUS T-shirt');
    res.body.products.forEach(p => {
      expect(p.price).toBeGreaterThanOrEqual(0);
      expect(p.price).toBeLessThanOrEqual(19);
    });
  });

  test('M4+M6: POST /product-filters returns empty when no products match', async () => {
    const res = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [], radio: [1000, 9999] });

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  test('M4+M6: GET /product-photo returns photo data for existing product', async () => {
    // Seed a product with photo data
    const clothing = await Category.findOne({ name: 'Clothing' });
    const productWithPhoto = await Product.create({
      name: 'Photo Test',
      slug: 'photo-test',
      description: 'Test',
      price: 10,
      category: clothing._id,
      quantity: 1,
      photo: {
        data: Buffer.from('fake-image-data'),
        contentType: 'image/jpeg',
      },
    });

    const res = await request(app)
      .get(`/api/v1/product/product-photo/${productWithPhoto._id}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  test('M4+M6: GET /product-photo returns 404 for non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/product/product-photo/${fakeId}`);

    expect(res.status).toBe(404);
  });

  test('M4+M6: GET /product-photo returns 500 for invalid product ID', async () => {
    const res = await request(app)
      .get('/api/v1/product/product-photo/not-a-valid-id');

    expect(res.status).toBe(500);
  });

  test('M4+M6: categories + product-list + product-count all consistent with DB state', async () => {
    const [catRes, productRes, countRes] = await Promise.all([
      request(app).get('/api/v1/category/get-category'),
      request(app).get('/api/v1/product/product-list/1'),
      request(app).get('/api/v1/product/product-count'),
    ]);

    expect(catRes.status).toBe(200);
    expect(productRes.status).toBe(200);
    expect(countRes.status).toBe(200);

    expect(catRes.body.category).toHaveLength(2);
    expect(productRes.body.products.length).toBeGreaterThan(0);
    expect(countRes.body.total).toBe(3);
    expect(countRes.body.total).toBe(productRes.body.products.length);
  });

  test('M4+M6: category filter + price filter returns correct intersection from real DB', async () => {
    const catRes = await request(app).get('/api/v1/category/get-category');
    const clothingId = catRes.body.category.find(c => c.name === 'Clothing')._id;

    const filterRes = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [clothingId], radio: [0, 19] });

    expect(filterRes.body.products).toHaveLength(1);
    expect(filterRes.body.products[0].name).toBe('NUS T-shirt');
    expect(filterRes.body.products[0].price).toBeLessThanOrEqual(19);
  });

  test('M4+M6: filter result count matches actual DB documents satisfying constraints', async () => {
    const catRes = await request(app).get('/api/v1/category/get-category');
    const electronicsId = catRes.body.category.find(c => c.name === 'Electronics')._id;

    const filterRes = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [electronicsId], radio: [] });

    expect(filterRes.body.products).toHaveLength(1);
    expect(filterRes.body.products[0].name).toBe('Dyson');
  });

  test('M4+M6: load more - page 2 returns different products than page 1', async () => {
    const clothing = await Category.findOne({ name: 'Clothing' });

    // Create products one at a time with distinct createdAt timestamps
    // This ensures sort({ createdAt: -1 }) produces a stable, deterministic order
    const extraProducts = [
      { name: 'Product A', price: 5,  slug: 'product-a' },
      { name: 'Product B', price: 6,  slug: 'product-b' },
      { name: 'Product C', price: 7,  slug: 'product-c' },
      { name: 'Product D', price: 8,  slug: 'product-d' },
      { name: 'Product E', price: 9,  slug: 'product-e' },
      { name: 'Product F', price: 10, slug: 'product-f' },
      { name: 'Product G', price: 11, slug: 'product-g' },
    ];

    for (const p of extraProducts) {
      await Product.create({
        ...p,
        category: clothing._id,
        description: p.name,
        quantity: 1,
      });
    }

    // Wait for all writes to flush
    const totalInDB = await Product.countDocuments();
    expect(totalInDB).toBe(10); // 3 from beforeEach + 7 extra

    const page1 = await request(app).get('/api/v1/product/product-list/1');
    const page2 = await request(app).get('/api/v1/product/product-list/2');

    expect(page1.body.products.length).toBe(6);
    expect(page2.body.products.length).toBeGreaterThan(0);

    // All products across both pages should be unique
    const page1Names = page1.body.products.map(p => p.name);
    const page2Names = page2.body.products.map(p => p.name);

    const overlap = page1Names.filter(n => page2Names.includes(n));
    expect(overlap).toHaveLength(0);

    // Verify all products appear exactly once across both pages
    const allNames = [...page1Names, ...page2Names];
    expect(allNames.length).toBe(totalInDB);
    expect(new Set(allNames).size).toBe(totalInDB);
  });
});
