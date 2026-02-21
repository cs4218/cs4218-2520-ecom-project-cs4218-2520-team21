// Paing Khant Kyaw, A0257992J
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

jest.mock("./../components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("About Page", () => {
  it("renders About page", () => {
    const { container } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    expect(container).toBeInTheDocument();
  });

  it("passes correct title to Layout component", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    const layout = getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "About us - Ecommerce app");
  });

  it("renders about image", () => {
    const { container,  } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    const image = container.querySelector('img[alt="contactus"]');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/about.jpeg");
  });

  it("renders text content", () => {
    const { getByText } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    expect(getByText("Add text")).toBeInTheDocument();
  });
});
