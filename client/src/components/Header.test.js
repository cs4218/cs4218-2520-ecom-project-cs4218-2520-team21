// Paing Khant Kyaw, A0257992J
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Header from "./Header";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";

jest.mock("antd", () => ({
  Badge: ({ count, showZero, children }) => (
    <div
      data-testid="cart-badge"
      data-count={String(count)}
      data-showzero={String(showZero)}
    >
      {children}
    </div>
  ),
}));

jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../hooks/useCategory", () => jest.fn());

jest.mock("./Form/SearchInput", () => {
  return function SearchInput() {
    return <div>SearchInput</div>;
  };
});

const mockLocalStorage = {
  removeItem: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header with brand name", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("🛒 Virtual Vault")).toBeInTheDocument();
  });

  it("shows Register and Login links when user is not authenticated", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("Register")).toBeInTheDocument();
    expect(getByText("Login")).toBeInTheDocument();
  });

  it("shows user name and Dashboard when normal user is authenticated", () => {
    const mockAuth = {
      user: { name: "John Doe", role: 0 },
      token: "mockToken",
    };
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("John Doe")).toBeInTheDocument();
    const dashBoard = getByText("Dashboard");
    expect(dashBoard).toBeInTheDocument();
    expect(dashBoard).toHaveAttribute("href", "/dashboard/user");
    expect(getByText("Logout")).toBeInTheDocument();
    expect(queryByText("Register")).not.toBeInTheDocument();
    expect(queryByText("Login")).not.toBeInTheDocument();
  });

  it("shows admin dashboard link when user is admin", () => {
    const mockAuth = {
      user: { name: "Admin User", role: 1 },
      token: "mockToken",
    };
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const dashboardLink = getByText("Dashboard");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
  });

  it("shows user dashboard link when user is not admin", () => {
    const mockAuth = {
      user: { name: "Regular User", role: 0 },
      token: "mockToken",
    };
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const dashboardLink = getByText("Dashboard");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/user");
  });

  it("displays cart badge with correct count", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[{ id: 1 }, { id: 2 }, { id: 3 }]]);
    useCategory.mockReturnValue([]);

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("Cart")).toBeInTheDocument();

    const badge = getByTestId("cart-badge");
    expect(badge).toHaveAttribute("data-count", "3");
    expect(badge).toHaveAttribute("data-showzero", "true");
  });

  it("renders categories in dropdown", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
    ]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("Categories")).toBeInTheDocument();
    expect(getByText("All Categories")).toBeInTheDocument();
    expect(getByText("Electronics")).toBeInTheDocument();
    expect(getByText("Clothing")).toBeInTheDocument();
  });

  it("handles logout correctly", () => {
    const mockSetAuth = jest.fn();
    const mockAuth = {
      user: { name: "John Doe", role: 0 },
      token: "mockToken",
    };
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const logoutButton = getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockSetAuth).toHaveBeenCalledWith({
      ...mockAuth,
      user: null,
      token: "",
    });
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth");
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });

  it("renders SearchInput component", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(getByText("SearchInput")).toBeInTheDocument();
  });

  it("renders Home link", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const homeLink = getByText("Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
