import { forgotPasswordController } from "./authController.js";
import userModel from "../models/userModel.js";
import * as authHelper from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
}));

describe("Forgot password controller", () => {
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

  test("Mising email", async () => {
    req.body.email = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is required",
    });
  });

  test("Mising newPassword", async () => {
    req.body.newPassword = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "New Password is required",
    });
  });

  test("Missing answer", async () => {
    req.body.answer = undefined;

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Answer is required",
    });
  });

  test("Password rest with invalid email and answer", async () => {
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("Successful register", async () => {
    userModel.findOne.mockResolvedValue(true);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("On exception thrown", async () => {
    userModel.findOne.mockImplementation(() => {
      throw new Error("some exception");
    });

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: new Error("some exception"),
    });
  });
});
