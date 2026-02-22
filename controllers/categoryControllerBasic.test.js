//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import { jest } from "@jest/globals";

import categoryModel from "../models/categoryModel.js";
import { 
  createCategoryController, 
  updateCategoryController, 
  deleteCategoryCOntroller 
} from "../controllers/categoryController.js";

jest.mock("slugify", () => jest.fn((text) => text.toLowerCase().replace(/ /g, "-")));

jest.mock("../models/categoryModel.js", () => {

  const MockModel = jest.fn();

  MockModel.findOne = jest.fn();
  MockModel.findByIdAndUpdate = jest.fn();
  MockModel.findByIdAndDelete = jest.fn();
  MockModel.find = jest.fn();

  return MockModel;
});

describe("Category Controller Tests for create, update and delete", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createCategoryController", () => {
    test("should create new category", async () => {
      req.body = { name: "Books" };
      
      categoryModel.findOne.mockResolvedValue(null);
   
      const mockSavedCategory = { name: "Books"};
      categoryModel.prototype.save = jest.fn().mockResolvedValue(mockSavedCategory);

      await createCategoryController(req, res);
      

      expect(categoryModel).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "books" 
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "new category created",
          category: mockSavedCategory,
        })
      );
    });

    test("should return 401 if name is missing", async () => {
      req.body = {name:""};

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(401); 
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });


    test("should return 500 if category already exists", async () => {
      req.body = { name: "Electronics" };
      categoryModel.findOne.mockResolvedValue({ name: "Electronics" });

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Category Already Exists",
      });
    });


    test("should return 500 if database error", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      req.body = { name: "Electronics" };

      categoryModel.findOne.mockImplementation(() => {
            throw new Error("Database error");
      });

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({message: "Database error"}),
             message: "Error in Category",
            })
        );
        logSpy.mockRestore();
     
    });
  });

    describe("updateCategoryController", () => {
      test("should update category successfully", async () => {
        req.body = { name: "Updated" };
        req.params = { id: "123" };

        const updatedCategory = { _id: "123", name: "Updated" };
        categoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

        await updateCategoryController(req, res);

        
        expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
          "123",
          { name: "Updated", slug: "updated" },
          { new: true }
        );


        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          message: "Category Updated Successfully",
          category: updatedCategory,
        });
      });
  
    test("category does not exist and thus cannot be updated returning 404 error", async () => {
     
      req.body = { name: "Books" };
      req.params = { id: "123" };
      categoryModel.findByIdAndUpdate.mockResolvedValue(null);
      
      await updateCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      
      expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Category not found",
          })
        );
     
    });
    
    test("should return 500 if there is a database error", async () => {
      req.body = { name: "Updated" };
      req.params = { id: "123" };
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      
      categoryModel.findByIdAndUpdate.mockImplementation(() => {
        throw new Error("Database error");;
      });

      await updateCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({message: "Database error"}),
          message: "Error while updating category",
        })
      );
      logSpy.mockRestore()
    });
    });


  describe("deleteCategoryCOntroller", () => {
     test("should delete category successfully", async () => {
        req.body = { name: "Delete" };
        req.params = { id: "123" };
        categoryModel.findByIdAndDelete.mockResolvedValue({id: "123", name: "Delete" });

        await deleteCategoryCOntroller(req, res);

        expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          message: "Category Deleted Successfully", 
        });
    });

    test("should return 404 when deleting a non-existent category", async () => {
      req.body = { name: "Delete" };
      req.params = { id: "123" };
      
      categoryModel.findByIdAndDelete.mockResolvedValue(null);

      await deleteCategoryCOntroller(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Category not found",
        })
      );
    });


    test("should return 500 if there is a database error", async () => {
        req.params = { id: "123" };
      
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        categoryModel.findByIdAndDelete.mockImplementation(() => {
          throw new Error("Database error");
        });

        await deleteCategoryCOntroller(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          success: false,
          message: "error while deleting category",
          error: expect.objectContaining({message: "Database error"})
        });
        logSpy.mockRestore()
    });
});
});