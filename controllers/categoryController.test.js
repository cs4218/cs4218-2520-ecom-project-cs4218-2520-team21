// Xenos Fiorenzo Anong, A0257672U
import categoryModel from "../models/categoryModel.js";
import { categoryControlller, singleCategoryController } from "./categoryController.js";

jest.mock("slugify", () => jest.fn((text) => text.toLowerCase().replace(/ /g, "-")));

jest.mock("../models/categoryModel.js");

const consoleSpy = jest.spyOn(console, "log");

let req, res;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("categoryControlller tests", () => {
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should send 200 response on successfully getting all categories", async () => {
    categoryModel.find.mockResolvedValue([]);

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: [],
    });
  });
  it("should send 500 response on error when getting all categories", async () => {
    categoryModel.find.mockRejectedValue("error");

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "error",
      message: "Error while getting all categories",
    });
    expect(consoleSpy).toHaveBeenCalledWith("error");
  });
});

describe("singleCategoryController tests", () => {
  beforeEach(() => {
    req = { body: {}, params: { slug: "slug" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it("should send 200 response on successfully getting single categories", async () => {
    categoryModel.findOne.mockResolvedValue({ fake: "category" });

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category: { fake: "category" },
    });
  });

  it("should send 500 response on error when getting single categories", async () => {
    categoryModel.findOne.mockRejectedValue("error");

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "error",
      message: "Error While getting Single Category",
    });
    expect(consoleSpy).toHaveBeenCalledWith("error");
  });
});
