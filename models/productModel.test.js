// Ariella Thirza Callista A0255876L
// AI tools were used to help configure mocks, generate edge cases and identify potential brittleness

import mongoose from "mongoose";
import Product from "../models/productModel.js"; 

describe("Product model validation (no DB)", () => {
  it("should be invalid if required fields are missing", async () => {
    const p = new Product({});
    let err;

    try {
      await p.validate();
    } catch (e) {
      err = e;
    }

    expect(err).toBeTruthy();
    expect(err.errors.name).toBeTruthy();
    expect(err.errors.slug).toBeTruthy();
    expect(err.errors.description).toBeTruthy();
    expect(err.errors.price).toBeTruthy();
    expect(err.errors.category).toBeTruthy();
    expect(err.errors.quantity).toBeTruthy();
  });

  it("should validate with all required fields present", async () => {
    const p = new Product({
      name: "Test Product",
      slug: "test-product",
      description: "A product for testing",
      price: 123,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: true,
    });

    await expect(p.validate()).resolves.toBeUndefined();
  });

  it("should accept photo buffer + contentType", async () => {
    const p = new Product({
      name: "Photo Product",
      slug: "photo-product",
      description: "Has photo",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      photo: {
        data: Buffer.from("abc"),
        contentType: "image/png",
      },
    });

    await expect(p.validate()).resolves.toBeUndefined();
    expect(Buffer.isBuffer(p.photo.data)).toBe(true);
    expect(p.photo.contentType).toBe("image/png");
  });
});