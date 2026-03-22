// Paing Khant Kyaw, A0257992J
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import startExpressApp from "../expressApp.js";
import { loginController } from "./authController.js";

let mongoServer;
let app;

const testUserPassword = "password123";
const testUser = {
  name: "Test User",
  email: "testlogin@example.com",
  phone: "12345678",
  address: "123 Test St",
  answer: "test",
  DOB: "2000-01-01",
};

beforeAll(async () => {
  app = startExpressApp(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  });

  const hashedPassword = await hashPassword(testUserPassword);
  await new userModel({ ...testUser, password: hashedPassword }).save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Integration with controller, database and helpers", () => {
  it("should login an existing user successfully", async () => {
    const req = {
      body: {
        email: testUser.email,
        password: testUserPassword,
      },
    };

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "login successfully",
      }),
    );
  });

  it("should return an error for a non-existent email", async () => {
    const req = {
      body: {
        email: "nonexistent@example.com",
        password: "wrongpassword",
      },
    };

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  it("should return an error for an invalid password", async () => {
    const req = {
      body: {
        email: testUser.email,
        password: "wrongpassword",
      },
    };

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  it("should return an error if email or password are not provided", async () => {
    const req = {
      body: {
        email: "",
        password: "",
      },
    };

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });
});

describe("Integration test using express server", () => {
  it("should login an existing user successfully", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUserPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("login successfully");
    expect(response.body.user).toHaveProperty("email", testUser.email);
    expect(response.body).toHaveProperty("token");
  });

  it("should return an error for a non-existent email", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Email is not registered");
  });

  it("should return an error for an invalid password", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid Password");
  });

  it("should return an error if email or password are not provided", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });
});
