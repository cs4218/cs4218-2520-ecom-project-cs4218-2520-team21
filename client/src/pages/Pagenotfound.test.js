// Paing Khant Kyaw, A0257992J
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Pagenotfound from "./Pagenotfound";

jest.mock("./../components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Pagenotfound Page", () => {
  it("renders essential component on Pagenotfound page", () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>,
    );

    expect(container).toBeInTheDocument();
    expect(getByText("404")).toBeInTheDocument();
    expect(getByText("Oops ! Page Not Found")).toBeInTheDocument();
    expect(getByText("Go Back")).toBeInTheDocument();
  });

  it("passes correct title to Layout component", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>,
    );

    const layout = getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "go back- page not found");
  });

  it("Go Back link navigates to home page", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>,
    );

    const link = getByText("Go Back");
    expect(link).toHaveAttribute("href", "/");
  });
});
