// Paing Khant Kyaw, A0257992J
import { testController } from "./authController.js";

describe("testController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("should send 'Protected Routes' on successful execution", () => {
    testController(req, res);

    expect(res.send).toHaveBeenCalledWith("Protected Routes");
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should handle errors and send error object", () => {
    const mockError = new Error("Test error");

    res.send
      .mockImplementationOnce(() => {
        throw mockError;
      })
      .mockReturnThis();

    testController(req, res);

    expect(res.send).toHaveBeenCalledWith({ error: mockError });
  });
});
