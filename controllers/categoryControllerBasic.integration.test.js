import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import categoryModel from "../models/categoryModel.js";
import { 
  createCategoryController, 
  updateCategoryController, 
  deleteCategoryCOntroller 
} from "../controllers/categoryController.js";

const app = express();
app.use(express.json());
app.post("/api/v1/category/create-category", createCategoryController);
app.put("/api/v1/category/update-category/:id", updateCategoryController);
app.delete("/api/v1/category/delete-category/:id", deleteCategoryCOntroller);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await categoryModel.deleteMany({});
});

describe("Create Category Integration Tests with categoryModel", () => {
  
  test("should save a new category to the database", async () => {
    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Mobile Phones" });

    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe("Mobile Phones");
    
    const dbCategory = await categoryModel.findOne({ name: "Mobile Phones" });
    expect(dbCategory).toBeDefined();
    expect(dbCategory.slug).toBe("mobile-phones");
  });

  test("should prevent duplicate categories", async () => {
    
    await new categoryModel({ name: "Laptop", slug: "laptop" }).save();

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Laptop" });

    expect(res.status).toBe(500); 
    expect(res.body.message).toBe("Category Already Exists");
  });
});

describe("Update Category Integration Tests with categoryModel", () => {
  test("should update a category name and slug in the DB", async () => {
    const original = await new categoryModel({ name: "Old", slug: "old" }).save();

    const res = await request(app)
      .put(`/api/v1/category/update-category/${original._id}`)
      .send({ name: "New and Improved" });

    expect(res.status).toBe(200);
    
    const updated = await categoryModel.findById(original._id);
    expect(updated.name).toBe("New and Improved");
    expect(updated.slug).toBe("new-and-improved");
  });


  test("should return 404 if the category ID does not exist in DB", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/v1/category/update-category/${fakeId}`)
      .send({ name: "Doesnt Matter" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Category not found");
  });

  test("should return 500 if a database error occurs", async () => {
    const response = await request(app)
      .put("/api/v1/category/update-category/123-not-a-real-id")
      .send({ name: "Error Test" });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Error while updating category");
  });
});
  


describe("Delete Category Integration Tests with categoryModel", () => {
  test("should remove the category from the collection", async () => {
    const category = await new categoryModel({ name: "Gone", slug: "gone" }).save();

    const res = await request(app).delete(`/api/v1/category/delete-category/${category._id}`);

    expect(res.status).toBe(200);
    
    const checkDb = await categoryModel.findById(category._id);
    expect(checkDb).toBeNull();
  });

  test("should return 404 if the category ID does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId(); 

    const res = await request(app).delete(`/api/v1/category/delete-category/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Category not found");
  });
  test("should return 500 if the ID format is invalid ", async () => {
    const res = await request(app).delete("/api/v1/category/delete-category/invalid-id-123");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("error while deleting category");
    expect(res.body.error).toBeDefined(); 
  });

});