import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import authRoutes from "../routes/authRoute.js";
import userModel from "../models/userModel.js";
import startExpressApp from "../expressApp.js";

let mongoServer;
let app;

beforeAll(async () => {
  app = startExpressApp(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await userModel.deleteMany({});
});

describe("POST /api/v1/auth/register", () => {
  it("should register a new user successfully", async () => {
    const newUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      phone: "12345678",
      address: "123 Test St",
      answer: "test",
      DOB: "2000-01-01",
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User Register Successfully");
    expect(response.body.user).toHaveProperty("name", "Test User");

    const savedUser = await userModel.findOne({ email: "test@example.com" });
    expect(savedUser).not.toBeNull();
    expect(savedUser.name).toBe("Test User");
  });

  it("should return an error if user already exists", async () => {
    const existingUser = {
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
      phone: "12345678",
      address: "123 Test St",
      answer: "test",
      DOB: "2000-01-01",
    };
    await userModel.create(existingUser);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(existingUser);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Already Register please login");
  });

  it("should return an error if required fields are missing", async () => {
    const incompleteUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(incompleteUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password is Required" });
  });
});
