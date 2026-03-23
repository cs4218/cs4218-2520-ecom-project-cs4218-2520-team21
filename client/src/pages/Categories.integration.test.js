// Xenos Fiorenzo Anong, A0257672U
import React from "react";
import axios from "axios";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Categories from "./Categories";
import { AuthProvider } from "../context/auth.js";
import { CartProvider } from "../context/cart.js";
import { SearchProvider } from "../context/search.js";
import useCategory from "../hooks/useCategory";

// stub api to just test hook integration
jest.mock("axios");

// mock external dependencies
const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
}));

afterEach(() => cleanup());
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Category Page <-> useCategory", () => {
  it("should render empty page if there are no categories", () => {
    axios.get.mockReturnValue({ data: { category: [] } });

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <Routes>
                <Route path="/categories" element={<Categories />} />
              </Routes>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const allLinks = screen.queryAllByRole("link");
    allLinks.forEach((link) => {
      expect(link).not.toHaveAttribute("href", /\/category\/.+/i);
    });
  });

  it("should correctly list categories with working links", async () => {
    axios.get.mockReturnValue({ data: { category: [{ name: "Category A", slug: "aslug" }] } });

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <Routes>
                <Route path="/categories" element={<Categories />} />
              </Routes>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const catLinks = await screen.findAllByText("Category A");
    expect(catLinks).toHaveLength(2); // 1 in navbar dropdown, 1 on main page
    catLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/category/aslug");
    });
  });
});
