// Xenos Fiorenzo Anong, A0257672U
import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import Categories from "./Categories";

const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
}));

jest.mock("../hooks/useCategory");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [
    {
      user: null,
      token: "",
    },
    jest.fn(),
  ]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

afterEach(() => cleanup());
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Category Page", () => {
  it("should render empty page if there are no categories", () => {
    useCategory.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>,
    );

    const allLinks = screen.queryAllByRole("link");
    allLinks.forEach((link) => {
      expect(link).not.toHaveAttribute("href", /\/category\/.+/i);
    });
  });

  it("should correctly list categories with working links", () => {
    useCategory.mockReturnValue([{ name: "Category A", slug: "aslug" }]);

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>,
    );

    const catLinks = screen.getAllByText("Category A");
    expect(catLinks).toHaveLength(2); // 1 in navbar dropdown, 1 on main page
    catLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/category/aslug");
    });
  });
});
