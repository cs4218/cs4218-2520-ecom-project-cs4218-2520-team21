// Paing Khant Kyaw, A0257992J
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import userModel from "../models/userModel.js";
import startExpressApp from "../expressApp.js";
import { registerController } from "./authController.js";

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

describe("Integration between controller, database and auth helper", () => {
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
    const req = { body: newUser };
    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const savedUser = await userModel.findOne({ email: "test@example.com" });
    expect(savedUser).not.toBeNull();
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User Register Successfully",
      }),
    );
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

    const req = { body: existingUser };
    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const want = {
      success: false,
      message: "Already Register please login",
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(want);
  });

  it("should return an error if required fields are missing", async () => {
    const incompleteUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const req = { body: incompleteUser };
    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const want = {
      message: "Password is Required",
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(want);
  });
});

describe("Integrate controller with express service", () => {
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

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Password is Required" });
  });
});
