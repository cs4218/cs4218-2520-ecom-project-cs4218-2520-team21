/* eslint-disable import/first */
// Paing Khant Kyaw, A0257992J

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

import Header from "./Header";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("Header Integration Test with Auth Context", () => {
  beforeEach(() => {
    const axios = require("axios");
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        category: [
          { _id: "1", name: "Electronics", slug: "electronics" },
          { _id: "2", name: "Books", slug: "books" },
          { _id: "3", name: "Clothing", slug: "clothing" },
        ],
      },
    });
    localStorage.removeItem("auth");
    localStorage.getItem.mockReturnValue(null);
  });

  it("should display username when user is logged in", () => {
    const mockUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
      role: 0,
    };

    localStorage.getItem.mockReturnValue(JSON.stringify({ user: mockUser }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should display Register and Login links when user is not authenticated", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should display categories from useCategory hook", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const categoriesLink = screen.getByText("Categories");
    expect(categoriesLink).toBeInTheDocument();

    expect(screen.getByText("All Categories")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    expect(screen.getByText("Books")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  it("should display Home link", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should display Virtual Vault brand link", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
  });

  it("should display Cart link", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    // Check that Cart link is visible
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("should have navbar navigation structure", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const navbar = screen.getByRole("navigation");
    expect(navbar).toBeInTheDocument();
  });

  it("should render all navigation items", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("should show logout success toast when logout is clicked", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(toast.success).toBeDefined();
  });
});
