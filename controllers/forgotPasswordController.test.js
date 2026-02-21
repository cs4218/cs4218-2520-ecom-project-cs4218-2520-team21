// Paing Khant Kyaw, A0257992J
import { forgotPasswordController } from "./authController.js";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
}));

describe("Given a forgot password request with user credentials", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "john-doe@nus.com",
        answer: "answer",
        newPassword: "victoria's secret",
      },
    };

    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    userModel.findOne.mockReset();
    userModel.mockReset && userModel.mockReset();
  });

  test("When the request is missing email", async () => {
    req.body.email = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is required",
    });
  });

  test("When the request is missing newPassword", async () => {
    req.body.newPassword = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "New Password is required",
    });
  });

  test("When the request is missing answer", async () => {
    req.body.answer = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Answer is required",
    });
  });

  test("When password reset email and answer does not match", async () => {
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("When forget password request is success", async () => {
    userModel.findOne.mockResolvedValue(true);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("When exception is thrown", async () => {
    userModel.findOne.mockRejectedValue(new Error("find one exception"));

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: new Error("find one exception"),
    });
  });
});
