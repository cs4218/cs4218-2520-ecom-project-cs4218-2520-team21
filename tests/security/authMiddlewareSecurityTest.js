// Xenos Fiorenzo Anong, A0257672U
import JWT from "jsonwebtoken";
import { requireSignIn } from "../../middlewares/authMiddleware.js";

jest.mock("jsonwebtoken");

describe("Auth middleware additional security tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
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

  afterEach(() => {});

  it("middleware should set request user correctly based on currently signed in user and avoid impersonation", async () => {
    const decodedUser = { _id: "someUser", email: "test@example.com" };
    const fakeUser = { _id: "someOtherUser", email: "test2@example.com" };

    req.headers.authorization = "some.jwt.token";
    JWT.verify.mockReturnValue(decodedUser);
    req.user = fakeUser; // try to impersonate someOtherUser while signed in as someUser

    await requireSignIn(req, res, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
