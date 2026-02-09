import { registerController } from "./authController.js";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
  comparePassword: jest.fn().mockReturnThis(),
}));
jest.mock("jsonwebtoken");

describe("Register Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "a@b.com",
        name: "john doe",
        password: "123456",
        phone: "123",
        address: "addr",
        answer: "ans",
      },
    };
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    userModel.findOne.mockReset();
    userModel.mockReset && userModel.mockReset();
  });

  test("Missing name", async () => {
    req.body.name = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("Missing email", async () => {
    req.body.email = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("Missing password", async () => {
    req.body.password = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("Missing phone number", async () => {
    req.body.phone = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({
      message: "Phone no is Required",
    });
  });

  test("Missing address", async () => {
    req.body.address = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("Missing answer", async () => {
    req.body.answer = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is Required",
    });
  });

  test("Existing user", async () => {
    userModel.findOne.mockResolvedValue(true);

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("Successful registration", async () => {
    const savedUser = { value: "saved user" };
    userModel.findOne.mockResolvedValue(null);
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedUser),
    }));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User Register Successfully",
        user: savedUser,
      }),
    );
  });

  test("On exception thrown", async () => {
    userModel.findOne.mockImplementation(() => {
      throw new Error("some exception");
    });

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in Registeration",
      error: new Error("some exception"),
    });
  });
});

