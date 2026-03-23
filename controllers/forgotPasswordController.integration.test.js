// Paing Khant Kyaw, A0257992J
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import startExpressApp from "../expressApp.js";

let mongoServer;
let app;

const originalPassword = "password123";
const testUser = {
  name: "Test User",
  email: "testforgot@example.com",
  phone: "12345678",
  address: "123 Test St",
  answer: "test-secret",
  DOB: "2000-01-01",
};

beforeAll(async () => {
  app = startExpressApp(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  });

  const hashedPassword = await hashPassword(originalPassword);
  await new userModel({ ...testUser, password: hashedPassword }).save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/v1/auth/forgot-password", () => {
  it("should reset the password successfully with correct email and answer", async () => {
    const newPassword = "newPassword456";
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: testUser.answer,
        newPassword: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Password Reset Successfully");

    const updatedUser = await userModel.findOne({ email: testUser.email });
    const isNewPasswordMatch = await comparePassword(
      newPassword,
      updatedUser.password,
    );
    const isOldPasswordMatch = await comparePassword(
      originalPassword,
      updatedUser.password,
    );

    expect(isNewPasswordMatch).toBe(true);
    expect(isOldPasswordMatch).toBe(false);
  });

  it("should return an error if the answer is wrong", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: "wrong-answer",
        newPassword: "someNewPassword",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Wrong Email Or Answer");
  });

  it("should return an error if the email does not exist", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: "nonexistent@example.com",
        answer: testUser.answer,
        newPassword: "someNewPassword",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Wrong Email Or Answer");
  });

  it("should return an error if newPassword is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testUser.email,
        answer: testUser.answer,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("New Password is required");
  });
});
