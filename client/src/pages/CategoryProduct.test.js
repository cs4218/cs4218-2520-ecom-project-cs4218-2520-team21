// Ariella Thirza Callista A0255876L
// AI tools were used to help configure mocks, generate edge cases and identify potential brittleness

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";

// Mocks
jest.mock("axios");

const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

// Fixtures
const mockCategory = {
  _id: "cat1",
  name: "Electronics",
  slug: "electronics",
};

const mockProducts = [
  {
    _id: "p1",
    name: "Laptop",
    slug: "laptop",
    description: "A powerful laptop",
    price: 1499.99
  },
  {
    _id: "p2",
    name: "Smartphone",
    slug: "smartphone",
    description: "A high-end smartphone",
    price: 999.99
  }
]

// Helper functions
const renderCategoryProduct = (slug = "electronics") => {
  render(
    <MemoryRouter initialEntries={[`/category/${slug}`]}>
      <Routes>
        <Route path="/category/:slug" element={<CategoryProduct />} />
      </Routes>
    </MemoryRouter>
  )
}

const mockDefaultAxios = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("product-category"))
      return Promise.resolve({ data: { category: mockCategory, products: mockProducts } });
    return Promise.reject(new Error("Unknown URL"));
  });
};


// Tests

beforeEach(() => {
  jest.clearAllMocks();
});

// 1. Given the CategoryProduct page, when it is rendered with a valid category slug, then it should fetch and display the category name and products.
describe("Given the CategoryProduct page", () => {
  describe("When it is rendered with a valid category slug", () => {
    beforeEach(() => {
      mockDefaultAxios();
    });

    it("Then should fetch the category name and products", async () => {
      renderCategoryProduct("electronics");

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
      });
    });

    it("Then should render the Category - heading with the category name", async () => {
      renderCategoryProduct("electronics");
      expect(await screen.findByText("Category - Electronics")).toBeInTheDocument();
    });

    it("Then should render the number of results found", async () => {
      renderCategoryProduct("electronics");
      expect(await screen.findByText("2 result found")).toBeInTheDocument();
    });
    
    it("Then should render the product cards with name, price and description", async () => {
      renderCategoryProduct("electronics");
      expect(await screen.findByText("Laptop")).toBeInTheDocument();
      expect(await screen.findByText("$1,499.99")).toBeInTheDocument();
      expect(await screen.findByText("A powerful laptop...")).toBeInTheDocument();
    });

    it("Then should render the More Details button for each product", async () => {
      renderCategoryProduct("electronics");
      expect(await screen.findAllByText("More Details")).toHaveLength(2);
    });

    it("Then should navigate to the product details page when More Details button is clicked", async () => {
      renderCategoryProduct("electronics");
      const moreDetailsButtons = await screen.findAllByText("More Details");
      fireEvent.click(moreDetailsButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
    });
  });

  describe("When it is rendered without a slug", () => {
    test("Then it should not fetch any products", async () => {
      render(
        <MemoryRouter initialEntries={["/category/"]}>
          <Routes>
            <Route path="/category/" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(axios.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("When the product-category API fails", () => {
    test("Then the page renders without crashing", async () => {
      axios.get.mockRejectedValue(new Error("Network error"));
      expect(() => renderCategoryProduct("electronics")).not.toThrow();
    });
  });
});