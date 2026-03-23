//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import express from "express";
import formidable from "express-formidable"; 
import { 
  createProductController, 
  deleteProductController, 
  updateProductController 
} from "../controllers/productController.js";

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel.js";


jest.mock("braintree");

const app = express();

app.post(
  "/api/v1/product/create-product", 
  formidable(), 
  createProductController
);

app.delete(
  "/api/v1/product/delete-product/:pid", 
  deleteProductController
);

app.put(
  "/api/v1/product/update-product/:pid", 
  formidable(), 
  updateProductController
);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Create Product Controller Integration Tests", () => {

  test("should create a product with an image", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", "Gaming Laptop")
      .field("description", "High performance laptop")
      .field("price", "1500")
      .field("category", new mongoose.Types.ObjectId().toString())
      .field("quantity", "10")
      .field("shipping", "0")
      .attach("photo", "tests/assets/adidas.png");

    expect(res.status).toBe(201);
    expect(res.body.products.name).toBe("Gaming Laptop");
    expect(res.body.products.slug).toBe("Gaming-Laptop");

    const product = await productModel.findOne({ name: "Gaming Laptop" });
    expect(product.photo.data).toBeDefined();
  });

  test("should return 500 if name is missing", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .field("description", "Missing name test");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Name is Required");
  });

  test("should return 500 if photo is missing", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", "No Photo Test")
      .field("description", "Testing missing photo")
      .field("price", "100")
      .field("category", new mongoose.Types.ObjectId().toString())
      .field("quantity", "10");
      

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Photo is Required");
  });

  test("should return 500 if photo is larger than 1MB", async () => {
    const bigBuffer = Buffer.alloc(1000001); 

    const res = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", "Large Photo Test")
      .field("description", "Testing size limit")
      .field("price", "100")
      .field("category", new mongoose.Types.ObjectId().toString())
      .field("quantity", "10")
      .attach("photo", bigBuffer, "large.jpg");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Photo should be less then 1mb");

  });

  test("should return 500 and trigger the catch block on database error", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", "Error Trigger Product")
      .field("description", "Testing the catch block")
      .field("price", "100")
      .field("category", "not-a-valid-mongodb-id") 
      .field("quantity", "10")
      .attach("photo", "tests/assets/adidas.png");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error in crearing product");
    expect(res.body.error).toBeDefined(); 
  });

});

describe("Update Product Controller Integration Tests", () => {
  test("should update product details", async () => {
  
    const initialProduct = await new productModel({
      name: "Old Phone",
      slug: "Old-Phone",
      description: "Old desc",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
      photo: {
        data: Buffer.from("existing-image-data"),
        contentType: "image/png"
      }
      }).save();

    const res = await request(app)
      .put(`/api/v1/product/update-product/${initialProduct._id}`)
      .field("name", "New Phone")
      .field("description", "New desc")
      .field("price", "120")
      .field("category", initialProduct.category.toString())
      .field("quantity", "5");

    expect(res.status).toBe(201);
    expect(res.body.products.name).toBe("New Phone");
  
    const updated = await productModel.findById(initialProduct._id);
    expect(updated.name).toBe("New Phone");
    expect(updated.slug).toBe("New-Phone");
  });

  test("should return 500 if name is missing during update", async () => {
    const res = await request(app)
      .put("/api/v1/product/update-product/some-id")
      .field("description", "Updating without a name")
      .field("price", "100")
      .field("category", new mongoose.Types.ObjectId().toString())
      .field("quantity", "10");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Name is Required");
  });

  test("should return 404 if the product ID does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .put(`/api/v1/product/update-product/${fakeId}`)
      .field("name", "New Name")
      .field("description", "Valid data, missing product")
      .field("price", "100")
      .field("category", new mongoose.Types.ObjectId().toString())
      .field("quantity", "10");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Product does not exist");
  });
    
  test("should return 500 if the new photo is larger than 1mb", async () => {
    const product = await new productModel({
    name: "Original", 
    slug: "org", 
    description: "desc", 
    price: 10, 
    category: new mongoose.Types.ObjectId(), 
    quantity: 1,
    photo: {
      data: Buffer.from("small-existing-image-data"),
      contentType: "image/png"
    }
  }).save();


  const largeBuffer = Buffer.alloc(1000001);

  const res = await request(app)
    .put(`/api/v1/product/update-product/${product._id}`)
    .field("name", "Updated Name")
    .field("description", "desc")
    .field("price", "10")
    .field("category", product.category.toString())
    .field("quantity", "1")
    .attach("photo", largeBuffer, "large-image.jpg");

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Photo should be less then 1mb");
});


test("should return 500 and trigger catch block for malformed ID", async () => {
  const res = await request(app)
    .put("/api/v1/product/update-product/123-not-a-uuid")
    .field("name", "Test")
    .field("description", "Test")
    .field("price", "10")
    .field("category", new mongoose.Types.ObjectId().toString())
    .field("quantity", "1");

  expect(res.status).toBe(500);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe("Error in Updte product");
});
});

describe("Delete Product Controller Integration Tests", () => {
  test("should delete a product and return 200", async () => {
    const product = await new productModel({
      name: "Delete Me",
      slug: "delete-me",
      description: "desc",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1
    }).save();

    const res = await request(app).delete(`/api/v1/product/delete-product/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product Deleted successfully");

    const check = await productModel.findById(product._id);
    expect(check).toBeNull();
  });

  test("should return 404 for non-existent product deletion", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/v1/product/delete-product/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });
});