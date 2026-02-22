// Paing Khant Kyaw, A0257992J
import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose");

describe("connectDB", () => {
  let consoleLogSpy;
  let originalEnv;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    originalEnv = process.env.MONGO_URL;
    process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.env.MONGO_URL = originalEnv;
  });

  it("should connect to MongoDB successfully", async () => {
    const mockConnection = {
      connection: {
        host: "localhost:27017",
      },
    };

    mongoose.connect.mockResolvedValue(mockConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });

  it("should log on error", async () => {
    const mockError = new Error("Connection failed");
    mongoose.connect.mockRejectedValue(mockError);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error in Mongodb"),
    );
  });
});
