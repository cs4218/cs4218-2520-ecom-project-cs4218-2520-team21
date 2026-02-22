// Paing Khant Kyaw, A0257992J
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have empty inputs initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByPlaceholderText("Enter Your Name")).toHaveValue("");
    expect(getByPlaceholderText("Enter Your Email")).toHaveValue("");
    expect(getByPlaceholderText("Enter Your Password")).toHaveValue("");
    expect(getByPlaceholderText("Enter Your Phone")).toHaveValue("");
    expect(getByPlaceholderText("Enter Your Address")).toHaveValue("");
    expect(getByPlaceholderText("Enter Your DOB")).toHaveValue("");
    expect(getByPlaceholderText("What is Your Favorite sports")).toHaveValue(
      "",
    );
  });

  it("all fields should be required", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByPlaceholderText("Enter Your Name")).toBeRequired();
    expect(getByPlaceholderText("Enter Your Email")).toBeRequired();
    expect(getByPlaceholderText("Enter Your Password")).toBeRequired();
    expect(getByPlaceholderText("Enter Your Phone")).toBeRequired();
    expect(getByPlaceholderText("Enter Your Address")).toBeRequired();
    expect(getByPlaceholderText("Enter Your DOB")).toBeRequired();
    expect(getByPlaceholderText("What is Your Favorite sports")).toBeRequired();
  });

  it("should update each input value when it changes", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const answerInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.change(addressInput, { target: { value: "123 Street" } });
    fireEvent.change(dobInput, { target: { value: "2000-01-01" } });
    fireEvent.change(answerInput, { target: { value: "Football" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(phoneInput).toHaveValue("1234567890");
    expect(addressInput).toHaveValue("123 Street");
    expect(dobInput).toHaveValue("2000-01-01");
    expect(answerInput).toHaveValue("Football");
  });

  it("should register the user successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { category: [] } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display error message when exception thrown", async () => {
    axios.post.mockRejectedValueOnce({ message: "User already exists" });
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("should display error message when success is false/undefined", async () => {
    axios.post.mockResolvedValue({
      data: { success: false, message: "User Already Exists" },
    });
    axios.get.mockResolvedValueOnce({ data: { category: [] } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("User Already Exists");
  });
});
