// Paing Khant Kyaw, A0257992J
import { registerController } from "./authController.js";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
  comparePassword: jest.fn().mockReturnThis(),
}));
jest.mock("jsonwebtoken");

describe("Given a registration request with user credentials", () => {
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

  test("When the request is missing name", async () => {
    req.body.name = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("When the request is missing email", async () => {
    req.body.email = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("When the request is missing password", async () => {
    req.body.password = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("When the request is missing phone number", async () => {
    req.body.phone = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({
      message: "Phone no is Required",
    });
  });

  test("When the request is missing address", async () => {
    req.body.address = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("When the request is missing answer", async () => {
    req.body.answer = undefined;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is Required",
    });
  });

  test("When the email is of an existing user", async () => {
    userModel.findOne.mockResolvedValue(true);

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("When registration is success", async () => {
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

  test("When exception thrown", async () => {
    userModel.findOne.mockRejectedValue(new Error("some exception"));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in Registeration",
      error: new Error("some exception"),
    });
  });
});
