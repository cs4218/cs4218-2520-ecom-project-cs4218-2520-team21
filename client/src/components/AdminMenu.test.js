//  Dhruvi Ketan Rathod A0259297J

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

describe("AdminMenu tests", () => {
  test("renders Admin Panel heading", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  test("renders all sections", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  test("links have correct paths", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Category").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/create-category");

    expect(screen.getByText("Create Product").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/create-product");

    expect(screen.getByText("Products").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/products");

    expect(screen.getByText("Orders").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/orders");
  });
});
