// Ariella Thirza Callista A0255876L
// AI tools (ChatGPT, Claude) were used to help configure mocks, generate edge cases and identify potential brittleness in tests

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProductDetails from "./ProductDetails";
import toast from 'react-hot-toast';


// Mocks
jest.mock('axios');

jest.mock('react-hot-toast', () => ({
  success: jest.fn()
}));

const mockSetCart = jest.fn();
jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], mockSetCart])
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('./../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));

// Fixtures
const mockProduct = {
  _id: "p1",
  name: "Laptop",
  slug: "laptop",
  description: "A powerful laptop",
  price: 20.99,
  category: { _id: "cat1", name: "Electronics" },
}

const mockRelatedProducts = [
  {
    _id: "p2",
    name: "Smartphone",
    slug: "smartphone",
    description: "A high-end smartphone",
    price: 999.99,
    category: { _id: "cat1", name: "Electornics" },
  },
    {
    _id: "p2",
    name: "Dyson",
    slug: "dyson-air",
    description: "Dyson Airwrap",
    price: 899.99,
    category: { _id: "cat1", name: "Electornics" },
  }
]

// Helper functions
const renderProductDetails = (slug = "laptop") => {
  render(
    <MemoryRouter initialEntries={[`/product/${slug}`]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductDetails/>} />
      </Routes>
    </MemoryRouter>
  );
};

const mockDefaultAxios = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("get-product"))
      return Promise.resolve({ data: { product: mockProduct } });
    if (url.includes("related-product"))
      return Promise.resolve({ data: { products: mockRelatedProducts}})
    return Promise.reject(new Error("Unknown URL"));
  });
};

// Tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given the ProductDetails page", () => {
  beforeEach(() => {
    mockDefaultAxios();
  });
  describe("when it is rendered with a valid product slug", () => {

    it("then should fetch the product", async () => {
      renderProductDetails("laptop");

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("get-product/laptop"));
      });
    });

    it("then should fetch similar products", async () => {
      renderProductDetails("laptop");
      const pid = mockProduct._id
      const cid = mockProduct.category._id

      await screen.findByText(/Laptop/)

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`related-product/${pid}/${cid}`));
      });
    });

    it("then should render the name, description, price and category of the product", async () => {
      renderProductDetails("laptop");
      expect(await screen.findByText(/Laptop/)).toBeInTheDocument();
      expect(await screen.findByText(/\$20\.99/)).toBeInTheDocument();
      expect(await screen.findByText(/A powerful laptop/)).toBeInTheDocument();
      expect(await screen.findByText(/Electronics/)).toBeInTheDocument();
    });

    it("then should render the ADD TO CART Button for the main product and related products", async () => {
      renderProductDetails("laptop");
      await screen.findByText("Smartphone");

      const rltd_prod_count = mockRelatedProducts.length
      expect(await screen.findAllByText("ADD TO CART")).toHaveLength(rltd_prod_count + 1);
    })

    it("then should render the More Details button for each of the related product", async () => {
      renderProductDetails("laptop");
      const rltd_prod_count = mockRelatedProducts.length
      expect(await screen.findAllByText("More Details")).toHaveLength(rltd_prod_count);
    })
  });

  describe("When it is rendered without a slug", () => {
    test("Then it should not fetch any products", async () => {
      render(
        <MemoryRouter initialEntries={["/product/"]}>
          <Routes>
            <Route path="/product/" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(axios.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("When the get-product API fails", () => {
    test("Then the page renders without crashing", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("get-product"))
          return Promise.reject(new Error("Network error"));
        if (url.includes("related-product"))
          return Promise.resolve({ data: { product: mockRelatedProducts } });
      });
      expect(() => renderProductDetails("laptop")).not.toThrow();
    });
  })

  describe("When the related-product API fails", () => {
    test("Then the page renders without crashing", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("get-product"))
          return Promise.resolve({ data: { product: mockProduct } });
        if (url.includes("related-product"))
          return Promise.reject(new Error("Network error"));
      });

      expect(() => renderProductDetails("laptop")).not.toThrow();
    });
  });

  describe("When the More Details button of the related product is clicked", () => {
    it("then should navigate to the product page", async () => {
      renderProductDetails("laptop");
      await screen.findByText("Smartphone"); // wait for related product
      
      const moreDetailsButtons = screen.getAllByText("More Details");
      fireEvent.click(moreDetailsButtons[0]);
      
      expect(mockNavigate).toHaveBeenCalledWith("/product/smartphone");
    });
  });

  describe("When the ADD TO CART button is clicked", () => {
    it("then should show toast success", async () => {
      renderProductDetails("laptop");
      await screen.findByText("Smartphone");

      const cartButtons = screen.getAllByText("ADD TO CART");
      fireEvent.click(cartButtons[0]);

      expect(toast.success).toHaveBeenCalled();
    });
    
    it("then should update the cart state", async () => {
      renderProductDetails("laptop");
      await screen.findByText("Smartphone");

      const cartButtons = screen.getAllByText("ADD TO CART");
      fireEvent.click(cartButtons[1]);

      expect(mockSetCart).toHaveBeenCalledWith([mockRelatedProducts[0]]);
    });

    it("then should save the cart to localStorage", async () => {
      const localStorageMock = jest.spyOn(Storage.prototype, 'setItem');
      renderProductDetails("laptop");
      await screen.findByText("Smartphone");

      const cartButtons = screen.getAllByText("ADD TO CART");
      fireEvent.click(cartButtons[1]);

      expect(localStorageMock).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([mockRelatedProducts[0]])
      );
    });
  });
});




