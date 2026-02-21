// Paing Khant Kyaw, A0257992J
import JWT from "jsonwebtoken";
import { requireSignIn, isAdmin } from "./authMiddleware.js";
import userModel from "../models/userModel.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("Auth Middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {});

  describe("requireSignIn", () => {
    describe("Given that user is logged in", () => {
      it("When request header contains valid token", async () => {
        const token = "valid.jwt.token";
        const decodedUser = { _id: "user123", email: "test@example.com" };

        req.headers.authorization = token;
        JWT.verify.mockReturnValue(decodedUser);

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        expect(req.user).toEqual(decodedUser);
        expect(next).toHaveBeenCalled();
      });

      it("When token is invalid or expired", async () => {
        const token = "invalid.jwt.token";
        const mockError = new Error("Invalid token");

        req.headers.authorization = token;
        JWT.verify.mockImplementation(() => {
          throw mockError;
        });

        await requireSignIn(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
          success: false,
          message: "Invalid or expired token",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("When verifying, should use JWT_SECRET from environment", async () => {
        const token = "valid.jwt.token";
        const decodedUser = { _id: "user123" };
        const originalSecret = process.env.JWT_SECRET;
        const secret = "test-secret";
        process.env.JWT_SECRET = secret;

        req.headers.authorization = token;
        JWT.verify.mockReturnValue(decodedUser);

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledWith(token, secret);

        process.env.JWT_SECRET = originalSecret;
      });
    });
  });

  describe("isAdmin", () => {
    it("when user is admin", async () => {
      const adminUser = {
        _id: "admin123",
        email: "admin@example.com",
        role: 1,
      };

      req.user = adminUser;
      userModel.findById.mockResolvedValue(adminUser);

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith("admin123");
      expect(next).toHaveBeenCalled();
    });

    it("When user is not admin", async () => {
      const regularUser = {
        _id: "user123",
        email: "user@example.com",
        role: 0,
      };

      req.user = regularUser;
      userModel.findById.mockResolvedValue(regularUser);

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "UnAuthorized Access",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("When findById throws an error", async () => {
      const mockError = new Error("Database error");

      req.user = { _id: "user123" };
      userModel.findById.mockRejectedValue(mockError);

      await isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in admin middleware",
      });
    });

    it("When user is not found", async () => {
      userModel.findById.mockResolvedValue(null);

      await isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "UnAuthorized Access",
      });
    });
  });
});
