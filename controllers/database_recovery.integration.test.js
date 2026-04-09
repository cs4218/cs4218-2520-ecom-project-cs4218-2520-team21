// Paing Khant Kyaw, A0257992J
/**
 * Database Recovery Test
 *
 * Tests that the backend can:
 * 1. Retrieve data while DB is connected
 * 2. Return errors with status 500 when DB is disconnected
 * 3. Recover and retrieve data again when DB is reconnected
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import startExpressApp from "../expressApp.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

let mongoServer;
let app;
let mongoUri;

const testProduct = {
  name: "Test Recovery Product",
  slug: "test-recovery-product",
  description: "A product for database recovery testing",
  price: 99.99,
  quantity: 50,
  photo: { data: Buffer.from(""), contentType: "image/jpeg" },
};

beforeAll(async () => {
  app = startExpressApp(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  const category = await categoryModel.create({
    name: "Recovery Test Category",
    slug: `recovery-category-${Date.now()}`,
  });

  await productModel.create({
    ...testProduct,
    category: category._id,
  });
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.log("Error disconnecting mongoose:", err);
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Database Recovery Integration Tests", () => {
  it("should retrieve products successfully when database is connected", async () => {
    const response = await request(app).get("/api/v1/product/get-product");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(
      Array.isArray(response.body.products) || Array.isArray(response.body),
    ).toBe(true);
  });

  it("should retrieve product count successfully when database is connected", async () => {
    const response = await request(app).get("/api/v1/product/product-count");

    expect(response.status).toBe(200);
  });

  it("should return error when database is disconnected", async () => {
    await mongoose.disconnect();

    const response = await request(app).get("/api/v1/product/get-product");

    expect(response.status).toBeGreaterThanOrEqual(500);
    expect([500, 503]).toContain(response.status);
  });

  it("should return error for product count when database is disconnected", async () => {
    const response = await request(app).get("/api/v1/product/product-count");

    expect(response.status).toBeGreaterThanOrEqual(500);
    expect([500, 503]).toContain(response.status);
  });

  it("should recover and retrieve products after database reconnection", async () => {
    await mongoose.connect(mongoUri);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await request(app).get("/api/v1/product/get-product");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(
      Array.isArray(response.body.products) || Array.isArray(response.body),
    ).toBe(true);
  });

  it("should retrieve product count after database recovery", async () => {
    const response = await request(app).get("/api/v1/product/product-count");

    expect(response.status).toBe(200);
  });

  it("should be able to query for the test product after recovery", async () => {
    const response = await request(app).get("/api/v1/product/get-product");

    expect(response.status).toBe(200);
    const products = response.body.products || response.body;
    const found = products.some((p) => p.name === testProduct.name);
    expect(found).toBe(true);
  });
});
