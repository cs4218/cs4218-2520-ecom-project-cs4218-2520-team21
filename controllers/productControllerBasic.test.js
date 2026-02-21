//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import { jest } from '@jest/globals';
import productModel from "../models/productModel.js";
import fs from "fs";
import { 
  createProductController, 
  updateProductController, 
  deleteProductController 
} from "../controllers/productController.js";

import slugify from "slugify";
jest.mock("fs");

jest.mock("braintree");

jest.mock("slugify", () => jest.fn((text) => text.toLowerCase().replace(/ /g, "-")));



jest.mock("../models/productModel.js", () => {
  
  const MockModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    photo: {}
  }));


  MockModel.findByIdAndDelete = jest.fn();
  MockModel.findByIdAndUpdate = jest.fn();
  MockModel.findOne = jest.fn();
  MockModel.find = jest.fn();

  return MockModel;
});

describe("Product Controller Tests for create, update and delete", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("createProductController", () => {
    test("should create new product", async () => {
      req = {
        fields: {
          name: "New Product",
          description: "Cool description",
          price: 99,
          category: "cat123",
          quantity: 10,
          shipping: "Yes"
        },
        files: {
          photo: { path: "fake/path.jpg", type: "image/jpeg", size: 500000 }
        }
      };

      await createProductController(req, res);

      expect(slugify).toHaveBeenCalledWith("New Product");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
      }));
    });


    test("should return 500 error if name is missing", async () => {
      req = {fields: {
        description: "Cool description",
        price: 99,
        category: "cat123",
        quantity: 10
      }
      };
      req.files = { photo: { size: 500000 } };

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });
    
    test("should return 500 error if photo size is greater than 1MB", async () => {
      req.fields = {
        name: "Large Product",
        description: "Desc",
        price: 10,
        category: "cat1",
        quantity: 5
      };
      req.files = {
        photo: { size: 2000000 } 
      };

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        error: "Photo should be less then 1mb" 
      });
    });
          
    test("should return 500 error if photo is missing", async () => {

      req.fields = {
        name: "Product Without Image",
        description: "Testing validation",
        price: 50,
        category: "cat123",
        quantity: 10
      };
      req.files = {}; 

      
      await createProductController(req, res);

      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Photo is Required" });
      
      expect(productModel).not.toHaveBeenCalled();
    });
    
    test("should return 500 and database error message when save fails", async () => {
      req.fields = {
        name: "Test Product",
        description: "Test Desc",
        price: 100,
        category: "cat123",
        quantity: 5
      };
      req.files = {
        photo: { path: "fake/path", type: "image/png", size: 1000 }
      };

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockError = new Error("Database connection failed");
      
      // productModelMock.prototype.save = jest.fn().mockRejectedValue(mockError);
      productModel.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValue(mockError),
      photo: {} 
    }));

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
              success: false,
              message: "Error in crearing product",
              error: mockError
    }));
    logSpy.mockRestore();
  });
  });

  describe("updateProductController", () => {
    beforeEach(() => {
  
      req = {
        params: { pid: "12345" },
        fields: {
          name: "Updated Product",
          description: "Updated Description",
          price: 199,
          category: "cat_id_678",
          quantity: 50,
          shipping: "No"
        },
        files: {
          photo: { path: "path/to/photo.jpg", type: "image/jpeg", size: 500000 }
        }
      };
    
    });

    test("should update product and save photo successfully", async () => {
   
      const mockProduct = {
        _id: "12345",
        photo: { data: null, contentType: null },
        save: jest.fn().mockResolvedValue(true)
      };

      productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
      fs.readFileSync.mockReturnValue(Buffer.from("fake_image_data"));

      await updateProductController(req, res);

     
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "12345",
        expect.objectContaining({ name: "Updated Product" }),
        { new: true }
      );
      expect(fs.readFileSync).toHaveBeenCalledWith("path/to/photo.jpg");
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
        products: mockProduct
      }));
    });

    test("should return 500 if a required field name is missing", async () => {
      req.fields.name = ""; 

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
      expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("should return 500 if photo size is larger than 1MB", async () => {
      req.files.photo.size = 2000000;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Photo should be less then 1mb" });
    });

    test("should handle case where product is not found", async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      productModel.findByIdAndUpdate.mockResolvedValue(null);

      await updateProductController(req, res);

      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error in Updte product" 
      }));
      logSpy.mockRestore();
    });

    test("should handle catch block errors (database failure)", async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error("Connection Timeout");
      productModel.findByIdAndUpdate.mockRejectedValue(error);

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error in Updte product",
        error: error
      }));
      logSpy.mockRestore();
  });
});
  describe("deleteProductController", () => {
    beforeEach(() => {
      req = {
        params: { pid: "product_id_999" }
      };
    });

    test("should delete a product successfully", async () => {
     
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ _id: "product_id_999", name: "Deleted Item" })
      };
      productModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await deleteProductController(req, res);


      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("product_id_999");
      // not sure
      expect(mockQuery.select).toHaveBeenCalledWith("-photo");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted successfully",
      });
    });

    test("should return 404 if product does not exist", async () => {
      const mockQuery = { select: jest.fn().mockResolvedValue(null) };
      productModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await deleteProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Product not found"
      }));
    });
    test("should handle errors and return 500", async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockError = new Error("Delete failed");
      productModel.findByIdAndDelete.mockImplementation(() => {
          throw mockError;
      });

      await deleteProductController(req, res);

     
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error while deleting product",
        error: mockError
      }));
      logSpy.mockRestore();
    });
  });
});

