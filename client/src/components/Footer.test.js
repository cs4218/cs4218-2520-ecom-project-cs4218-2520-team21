// Paing Khant Kyaw, A0257992J
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer Component", () => {
  it("renders footer with copyright text", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
  });

  it("renders About link with correct path", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const aboutLink = getByText("About");
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("renders Contact link with correct path", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const contactLink = getByText("Contact");
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("renders Privacy Policy link with correct path", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const policyLink = getByText("Privacy Policy");
    expect(policyLink).toBeInTheDocument();
    expect(policyLink).toHaveAttribute("href", "/policy");
  });
});
