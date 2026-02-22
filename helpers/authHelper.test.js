// Paing Khant Kyaw, A0257992J
import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

jest.mock("bcrypt");

describe("Auth Helper Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
  });

  describe("HashPassword Test, Given a password", () => {
    it("should call bcrypt.hash with password and saltRounds", async () => {
      const password = "myPassword123";
      bcrypt.hash.mockResolvedValue("something");

      await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("should return hashed password on", async () => {
      const password = "myPassword123";
      const hashedPassword = "hashedPassword123";

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
    });

    it("should return undefined when hashing failed", async () => {
      const password = "myPassword123";
      const mockError = new Error("Hashing failed");

      bcrypt.hash.mockRejectedValue(mockError);

      await expect(hashPassword(password)).resolves.not.toThrow();
    });

    it("should return undefined when error occurs", async () => {
      const password = "myPassword123";
      const mockError = new Error("Hashing failed");

      bcrypt.hash.mockRejectedValue(mockError);

      const result = await hashPassword(password);

      expect(result).toBeUndefined();
    });
  });

  describe("comparePassword Test", () => {
    it("should call bcrypt.compare with password and hashedPassword", async () => {
      const password = "pass";
      const hashedPass = "hashedPass";

      bcrypt.compare.mockResolvedValue(true);

      await comparePassword(password, hashedPass);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPass);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
