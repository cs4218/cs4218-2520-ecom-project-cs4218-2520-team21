// Ariella Thirza Callista A0255876L
// AI tools were used to help configure mocks, generate edge cases and identify potential brittleness

import { 
  getProductController,
  getSingleProductController, 
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
 } from "./productController.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

import { describe } from "node:test";

jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");


const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn();
  res.set = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
}

beforeEach(() => {
  jest.clearAllMocks()
})

// 1. getProductController 

describe("Given getProductController", () => {
  describe("When the database query succeeds", () => {
    it("should respond with HTTP 200 and products fetched and total count", async () => {
      const req = {};
      const res = makeRes();

      const mockProducts = [
        { _id: "p1", name: "Product 1", price: 10 },
        { _id: "p2", name: "Product 2", price: 20 }
      ];

      productModel.find.mockReturnValue({ // stub db (productModel)
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      });

      await getProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({}); 
      expect(res.status).toHaveBeenCalledWith(200); // mock response object
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          countTotal: mockProducts.length,
          products: mockProducts
        })
      );
    });
  });
  describe("When the database query throws an error", () => {
    it("should respond with HTTP 500 and the error", async () => {
      const req = {};
      const res = makeRes();

      const mockError = new Error("Database error");
      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(mockError)
      });

      await getProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError
        })
      );
    });
  });

  describe("When query returns empty", () => {
    it("should respond with HTTP 200 with an empty array and 0 product count", async () => {
      const req = {};
      const res = makeRes();

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      });

      await getProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          countTotal: 0,
          products: [],
        })
      );
    });
  });
});

// 2. getSingleProductController 

describe("Given getSingleProductController", () => {
  describe("When query is successful", () => {
    it("should respond with HTTP 200 and the product fetched", async () => {
      // Arrange
      const req = {
        params: { slug: "product-1" }
      };
      const res = makeRes();

      const mockProduct = [
        { _id: "p1", name: "Product 1", price: 10 },
      ];

      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProduct)
      })

      // Act
      await getSingleProductController(req, res);

      // Assert
      expect(productModel.findOne).toHaveBeenCalledWith({ slug: "product-1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          product: mockProduct
        })
      )
    });
  });
  describe("When query fails", () => {
    it("should return 500 and the error", async () => {
      // Arrange
      const req = {
        params: { slug: "product-1" }
      };
      const res = makeRes();
      const mockError = new Error("Database error");

      
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(mockError)
      })

      await getSingleProductController(req, res);

      // Assert
      expect(productModel.findOne).toHaveBeenCalledWith({ slug: "product-1" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError
        })
      );
    });
  });

  describe("When slug not found i.e. product does not exist", () => {
    it("should return 404", async () => {
      const req = { params: { slug: "does-not-exist" } } ;
      const res = makeRes();

      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      });

      await getSingleProductController(req, res);

      expect(productModel.findOne).toHaveBeenCalledWith({ slug: "does-not-exist" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe("When slug is missing from req body", () => {
    it("should return 400 (validation failure)", async () => {
      const req = { params: {} }
      const res = makeRes();    
      
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      })

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    })
  })
});

// 3. productPhotoController
describe("Given productPhotoController", () => {
  describe("When query is successful", () => {
    it("should respond with HTTP 200 and the product photo", async () => {
      const req = { params: { pid: "p1" } };
      const res = makeRes();

      const photoBuffer = Buffer.from("fake-image-data");

      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ 
          photo: {
            data: photoBuffer,
            contentType: "image/png"
          }
         })
      });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith("p1");
      expect(res.set).toHaveBeenCalledWith("Content-type", "image/png");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(photoBuffer);
    });
  });
  describe("When query fails", () => {
    it("should respond with HTTP 500 and the error", async () => {
      const req = { params: { pid: "p1" } };
      const res = makeRes();

      const mockError = new Error("Database error");

      productModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError)
      });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith("p1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError
        })
      );
    });
  });
  describe("When photo of product does not exist", () => {
    it("should respond with HTTP 404 not found", async () => {
      const req = { params: { pid: "p1" } };
      const res = makeRes();

      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ photo: null })
      });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith("p1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  })

  describe("When product with pid does not exist", () => {
    it("should respond with HTTP 404 not found", async () => {
      const req = { params: { pid: "p1" } };
      const res = makeRes();

      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith("p1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe("When pid is missing", () => {
    it("should return 400 bad request", async () => {
      const req = { params: {} }
      const res = makeRes();    
    
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });
});

describe("Given productFiltersController", () => { 
  describe("When query is successful", () => {
    it("should respond with HTTP 200 and the filtered products", async () => {
      // Arrange
      const req = {
        body: {
          checked: ["cat1", "cat2"],
          radio: [0, 19]
        }
      };
      const res = makeRes();

      const mockFilteredProducts = [
        { _id: "p1", name: "Product 1", price: 10, category: "cat1" },
        { _id: "p2", name: "Product 2", price: 15, category: "cat2" }
      ];

      productModel.find.mockReturnValue(mockFilteredProducts);

      // Act
      await productFiltersController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({
        category: ["cat1", "cat2"],
        price: { $gte: 0, $lte: 19 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockFilteredProducts
        })
      );
    });
  });

  describe("When query fails", () => {
    it("should respond with HTTP 500 and the error", async () => {
      // Arrange
      const req = {
        body: {
          checked: ["cat1", "cat2"],
          radio: [0, 19]
        }
      };
      const res = makeRes();

      const mockError = new Error("Database error");

      productModel.find.mockRejectedValue(mockError);

      // Act
      await productFiltersController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({
        category: ["cat1", "cat2"],
        price: { $gte: 0, $lte: 19 }
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError
        })
      );
    });
  });

  describe("When product matching filters is not found", () => {
    it("should respond with HTTP 200 and an empty product array", async () => {
      const req = {
        body: {
          checked: ["cat1", "cat2"],
          radio: [0, 19]
        }
      };
      const res = makeRes();

      productModel.find.mockResolvedValue([]);

      // Act
      await productFiltersController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({
        category: ["cat1", "cat2"],
        price: { $gte: 0, $lte: 19 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: []
        })
      );
    });
  });

  describe("When only category filter is provided", () => {
    it("should respond with HTTP 200 and filtered products", async () => {
      const req = {
        body: {
          checked: ["cat1"],
          radio: []
        }
      };
      const res = makeRes();

      const mockProducts = [
        { _id: "p1", category: "cat1", price: 10 }
      ];

      productModel.find.mockResolvedValue(mockProducts);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: ["cat1"]
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockProducts
        })
      );
    });
  });
  describe("When only price filter is provided", () => {
    it("should respond with HTTP 200 and filtered products", async () => {
      const req = {
        body: {
          checked: [],
          radio: [0, 50]
        }
      };
      const res = makeRes();

      const mockProducts = [
        { _id: "p1", price: 30 }
      ];

      productModel.find.mockResolvedValue(mockProducts);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        price: { $gte: 0, $lte: 50 }
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
  describe("When both filters are empty arrays", () => {
    it("should respond with HTTP 400 and not call database", async () => {
      const req = {
        body: {
          checked: [],
          radio: []
        }
      };
      const res = makeRes();

      await productFiltersController(req, res);

      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
  describe("When price range is invalid", () => {
    it("should respond with HTTP 400", async () => {
      const req = {
        body: {
          checked: [],
          radio: [100, 10]
        }
      };
      const res = makeRes();

      await productFiltersController(req, res);

      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
  describe("When price array length is not 2", () => {
    it("should respond with HTTP 400", async () => {
      const req = {
        body: {
          checked: [],
          radio: [10]
        }
      };
      const res = makeRes();

      await productFiltersController(req, res);

      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
  describe("When request body is missing", () => {
    it("should respond with HTTP 400", async () => {
      const req = {};
      const res = makeRes();

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

// 5. productCountController

describe("Given productCountController", () => {
  describe("When query succeeds", () => {
    it("should return 200 with the total count of products", async () => {
      const req = {};
      const res = makeRes();

      const mockTotal = 10;

      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotal)
      });

      // Act
      await productCountController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: mockTotal
      });
    });
  });
  describe("When query fails", () => {
    it("should return 500 with the error", async () => {
      const req = {};
      const res = makeRes();

      const mockError = new Error("Database error");

      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockRejectedValue(mockError)
      });

      // Act
      await productCountController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError
        })
      );
    });
  });

  describe("When there are no products in the database", () => {
    it("should return 200 with total count = 0", async () => {
      const req = {};
      const res = makeRes();

      const mockTotal = 0;

      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotal)
      });

      // Act
      await productCountController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: mockTotal
      });
    })
  });
});

// 6. productListController
describe("Given productListController", () => {
  describe("When page param is provided", () => {
    it("should return 200 with correct products for that page", async () => {
      const req = { params: { page: 1} };
      const res = makeRes();
      const mockProducts = [
        { _id: "p1", name: "Product 1", price: 10 },
        { _id: "p2", name: "Product 2", price: 20 },
      ];

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await productListController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockProducts
        })
      )
    });
  });

  describe("When page param is not provided", () => {
    it("should default to page 1 and return 200", async () => {
      const req = { params: {} };
      const res = makeRes();
      const mockProducts = [
        { _id: "p1", name: "Product 1", price: 10 },
        { _id: "p2", name: "Product 2", price: 20 },
      ];

      const skipMock = jest.fn().mockReturnThis();

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: skipMock,
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await productListController(req, res);

      expect(skipMock).toHaveBeenCalledWith(0); // default page = 1
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockProducts,
        })
      );
    });
  });

  describe("When query fails", () => {
    it("should return 450 with the error", async () => {
      const req = { params: { page: 1 } };
      const res = makeRes();

      const mockError = new Error("Database error");
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(mockError),
      });

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError,
        })
      );
    });
  });

  describe("When page param is 0 or negative", () => {
    it("should return 400 since skip would be negative", async () => {
      const req = { params: { page: -4 } };
      const res = makeRes();
  
      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
  describe("When page param is non-numeric", () => {
    it("should return 400", async () => {
      const req = { params: { page: "abc" } };
      const res = makeRes();

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});

// 7. searchProductController
describe("Given searchProductController", () => {
  const mockResults = [
    { _id: "p1", name: "Product 1", description: "some description" },
    { _id: "p2", name: "Product 2", description: "another description" },
  ];

  describe("When keyword matches products", () => {
    it("should return matched products as JSON", async () => {
      const req = { params: { keyword: "product" } };
      const res = makeRes();
      res.json = jest.fn();

      productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockResults),
      });

      await searchProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: "product", $options: "i" } },
          { description: { $regex: "product", $options: "i" } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });
  });

  describe("When keyword matches no products", () => {
    it("should return an empty array as JSON", async () => {
      const req = { params: { keyword: "nonexistent" } };
      const res = makeRes();
      res.json = jest.fn();

      productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await searchProductController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("When keyword is missing", () => {
    it("should search with undefined keyword and return results as JSON", async () => {
      const req = { params: {} };
      const res = makeRes();
      res.json = jest.fn();

      productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await searchProductController(req, res);


      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("When query fails", () => {
    it("should return 500 with the error", async () => {
      const req = { params: { keyword: "product" } };
      const res = makeRes();
      res.json = jest.fn();

      const mockError = new Error("Database error");
      productModel.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError),
      });

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError,
        })
      );
    });
  });

})


// 8. realtedProductController
describe("Given realtedtedProductController", () => {
  const mockProducts = [
    { _id: "p2", name: "Product 2", category: "cat1" },
    { _id: "p3", name: "Product 3", category: "cat1" },
  ];

  const mockChain = (resolvedValue) => ({
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue(resolvedValue),
  });

  describe("When query succeeds", () => {
    it("should return 200 with related products", async () => {
      const req = { params: { pid: "p1", cid: "cat1" } };
      const res = makeRes();

      productModel.find.mockReturnValue(mockChain(mockProducts));

      await realtedProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: "cat1",
        _id: { $ne: "p1" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockProducts,
        })
      );
    });
  });

  describe("When no related products are found", () => {
    it("should return 200 with an empty array", async () => {
      const req = { params: { pid: "p1", cid: "cat1" } };
      const res = makeRes();

      productModel.find.mockReturnValue(mockChain([]));

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: [],
        })
      );
    });
  });

  describe("When pid is missing", () => {
    it("should search with undefined pid and return 200 (documents missing validation bug)", async () => {
      const req = { params: { cid: "cat1" } };
      const res = makeRes();

      productModel.find.mockReturnValue(mockChain(mockProducts));

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("When cid is missing", () => {
    it("should search with undefined cid and return 200 (documents missing validation bug)", async () => {
      const req = { params: { pid: "p1" } };
      const res = makeRes();

      productModel.find.mockReturnValue(mockChain(mockProducts));

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("When query fails", () => {
    it("should return 400 with the error", async () => {
      const req = { params: { pid: "p1", cid: "cat1" } };
      const res = makeRes();

      const mockError = new Error("Database error");
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError,
        })
      );
    });
  });
});

// 9. productCategoryController
describe("Given productCategoryController", () => {
  const mockCategory = { _id: "cat1", name: "Electronics", slug: "electronics" };
  const mockProducts = [
    { _id: "p1", name: "Product 1", category: "cat1" },
    { _id: "p2", name: "Product 2", category: "cat1" },
  ];

  describe("When query succeeds", () => {
    it("should return 200 with category and products", async () => {
      const req = { params: { slug: "electronics" } };
      const res = makeRes();

      categoryModel.findOne.mockResolvedValue(mockCategory);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProducts),
      });

      await productCategoryController(req, res);

      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "electronics" });
      expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          category: mockCategory,
          products: mockProducts,
        })
      );
    });
  });

  describe("When category is not found", () => {
    it("should return 200 with null category and empty products (documents missing 404 handling)", async () => {
      const req = { params: { slug: "does-not-exist" } };
      const res = makeRes();

      categoryModel.findOne.mockResolvedValue(null);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await productCategoryController(req, res);

      // bug: controller does not handle null category, should return 404
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          category: null,
          products: [],
        })
      );
    });
  });

  describe("When slug is missing", () => {
    it("should return 400 as input is invalid", async () => {
      const req = { params: {} };
      const res = makeRes();

      categoryModel.findOne.mockResolvedValue(null);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await productCategoryController(req, res);

      expect(categoryModel.findOne).not.toHaveBeenCalled();
      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("When categoryModel.findOne fails", () => {
    it("should return 500 with the error", async () => {
      const req = { params: { slug: "electronics" } };
      const res = makeRes();

      const mockError = new Error("Database error");
      categoryModel.findOne.mockRejectedValue(mockError);

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError,
        })
      );
    });
  });

  describe("When productModel.find fails", () => {
    it("should return 500 with the error", async () => {
      const req = { params: { slug: "electronics" } };
      const res = makeRes();

      const mockError = new Error("Database error");
      categoryModel.findOne.mockResolvedValue(mockCategory);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: mockError,
        })
      );
    });
  });
});
