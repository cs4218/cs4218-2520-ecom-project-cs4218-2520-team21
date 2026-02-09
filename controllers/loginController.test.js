import { loginController } from "./authController.js";
import userModel from "../models/userModel.js";
import * as authHelper from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
  comparePassword: jest.fn().mockReturnThis(),
}));
jest.mock("jsonwebtoken");

describe("Login Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "john-doe@nus.com",
        password: "victoria's secret",
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

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Mising password", async () => {
    req.body.password = undefined;

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Unregisterd Email", async () => {
    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  test("Wrong password", async () => {
    authHelper.comparePassword.mockResolvedValue(null);
    userModel.findOne.mockResolvedValue(true);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("Successful login", async () => {
    const user = { name: "user" };
    const jwt = { name: "JWT" };
    authHelper.comparePassword.mockResolvedValue(true);
    userModel.findOne.mockResolvedValue(user);
    JWT.sign.mockResolvedValue(jwt);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: user,
      token: jwt,
    });
  });

  test("On exception thrown", async () => {
    userModel.findOne.mockImplementation(() => {
      throw new Error("some exception");
    });

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: new Error("some exception"),
    });
  });
});


