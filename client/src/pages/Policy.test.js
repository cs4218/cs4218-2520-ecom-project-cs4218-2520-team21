// Xenos Fiorenzo Anong, A0257672U
import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import Policy from "./Policy";
import { MemoryRouter, Routes, Route } from "react-router-dom";

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
describe("Contact Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => cleanup());

  it("should render without errors", () => {
    render(
      <MemoryRouter initialEntries={["/policy"]}>
        <Routes>
          <Route path="/policy" element={<Policy />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/privacy policy/i).length).toBeGreaterThan(0);
  });
});
