import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

jest.mock("bcrypt");

describe("Auth Helper", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("hashPassword", () => {
    it("should call bcrypt.hash with password and saltRounds", async () => {
      const password = "myPassword123";
      const hashedPassword = "hashedPassword123";

      bcrypt.hash.mockResolvedValue(hashedPassword);

      await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("should return hashed password on success", async () => {
      const password = "myPassword123";
      const hashedPassword = "hashedPassword123";

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
    });

    it("should call console.log with error when bcrypt.hash throws", async () => {
      const password = "myPassword123";
      const mockError = new Error("Hashing failed");

      bcrypt.hash.mockRejectedValue(mockError);

      await hashPassword(password);

      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    it("should not throw error when bcrypt.hash throws", async () => {
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

  describe("comparePassword", () => {
    it("should call bcrypt.compare with password and hashedPassword", async () => {
      const password = "pass";
      const hashedPass = "hashedPass";

      bcrypt.compare.mockResolvedValue(true);

      await comparePassword(password, hashedPass);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPass);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it("should return true when passwords match", async () => {
      const password = "pass";
      const hashedPass = "hashedPass";

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPass);

      expect(result).toBe(true);
    });

    it("should return false when passwords do not match", async () => {
      const password = "pass";
      const hashedPass = "hashedPass";

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hashedPass);

      expect(result).toBe(false);
    });
  });
});
