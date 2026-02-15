import JWT from "jsonwebtoken";
import { requireSignIn, isAdmin } from "./authMiddleware.js";
import userModel from "../models/userModel.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("Auth Middleware", () => {
  let consoleLogSpy;
  let req;
  let res;
  let next;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
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

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("requireSignIn", () => {
    it("should verify token and call next on success", async () => {
      const token = "valid.jwt.token";
      const decodedUser = { _id: "user123", email: "test@example.com" };

      req.headers.authorization = token;
      JWT.verify.mockReturnValue(decodedUser);

      await requireSignIn(req, res, next);

      expect(JWT.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
    });

    it("should set req.user with decoded token data", async () => {
      const token = "valid.jwt.token";
      const decodedUser = {
        _id: "user123",
        email: "test@example.com",
        role: 1,
      };

      req.headers.authorization = token;
      JWT.verify.mockReturnValue(decodedUser);

      await requireSignIn(req, res, next);

      expect(req.user).toBe(decodedUser);
    });

    it("should log error when JWT verification fails", async () => {
      const token = "invalid.jwt.token";
      const mockError = new Error("Invalid token");

      req.headers.authorization = token;
      JWT.verify.mockImplementation(() => {
        throw mockError;
      });

      await requireSignIn(req, res, next);

      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    it("should not call next when token verification fails", async () => {
      const token = "invalid.jwt.token";
      const mockError = new Error("Invalid token");

      req.headers.authorization = token;
      JWT.verify.mockImplementation(() => {
        throw mockError;
      });

      await requireSignIn(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it("should use JWT_SECRET from environment", async () => {
      const token = "valid.jwt.token";
      const decodedUser = { _id: "user123" };
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "test-secret";

      req.headers.authorization = token;
      JWT.verify.mockReturnValue(decodedUser);

      await requireSignIn(req, res, next);

      expect(JWT.verify).toHaveBeenCalledWith(token, "test-secret");

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("isAdmin", () => {
    it("should call next when user is admin (role === 1)", async () => {
      const adminUser = {
        _id: "admin123",
        email: "admin@example.com",
        role: 1,
      };

      req.user = { _id: "admin123" };
      userModel.findById.mockResolvedValue(adminUser);

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith("admin123");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not admin (role !== 1)", async () => {
      const regularUser = {
        _id: "user123",
        email: "user@example.com",
        role: 0,
      };

      req.user = { _id: "user123" };
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

    it("should handle error when user lookup fails", async () => {
      const mockError = new Error("Database error");

      req.user = { _id: "user123" };
      userModel.findById.mockRejectedValue(mockError);

      await isAdmin(req, res, next);

      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in admin middleware",
      });
    });

    it("should not call next when error occurs", async () => {
      const mockError = new Error("Database error");

      req.user = { _id: "user123" };
      userModel.findById.mockRejectedValue(mockError);

      await isAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it("should handle null user from database", async () => {
      req.user = { _id: "nonexistent123" };
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
