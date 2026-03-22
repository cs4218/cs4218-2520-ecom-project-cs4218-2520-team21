//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import CreateCategory from "./CreateCategory";
import CreateProduct from "./CreateProduct";

jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../components/Header", () => () => <div>Header</div>);
jest.mock("../../components/Footer", () => () => <div>Footer</div>);

let mockCategories;

describe("Test Workflow: CreateCategory -> CreateProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCategories = [
      { _id: "1", name: "Electronics" }
    ];

    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
    });

    axios.post.mockImplementation((url, body) => {
      if (url === "/api/v1/category/create-category") {
        const newCategory = {
          _id: Date.now().toString(),
          name: body.name,
        };

        mockCategories.push(newCategory);

        return Promise.resolve({
          data: { success: true },
        });
      }

      if (url === "/api/v1/product/create-product") {
        return Promise.resolve({
          data: { success: true },
        });
      }
    });
  });

  test("user creates category and it appears in product dropdown", async () => {
    const {unmount} = 
      render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter new category/i);

    fireEvent.change(input, { target: { value: "Gaming" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Gaming is created");
    });

    unmount();
  
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    const selectTrigger = await screen.findByText("Select a category");
    fireEvent.mouseDown(selectTrigger);

    const option = await screen.findByText((content, element) => {
      return element.classList.contains("ant-select-item-option-content") &&
            content === "Gaming";
    });

    expect(option).toBeInTheDocument();

 
  });

  test("user creates category and checks if product created successfully", async () => {
    const {unmount} = 
      render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter new category/i);

    fireEvent.change(input, { target: { value: "Gaming" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Gaming is created");
    });

    unmount();
  
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    const selectTrigger = await screen.findByText("Select a category");
    fireEvent.mouseDown(selectTrigger);

    const option = await screen.findByText((content, element) => {
      return element.classList.contains("ant-select-item-option-content") &&
            content === "Gaming";
    });

    await act(async () => option.click());
    const nameInput = screen.getByPlaceholderText("write a name");
    const descInput = screen.getByPlaceholderText("write a description");
    const priceInput = screen.getByPlaceholderText("write a Price");
    const qtyInput = screen.getByPlaceholderText("write a quantity");

    fireEvent.change(nameInput, { target: { value: "Laptop" } });
    fireEvent.change(descInput, { target: { value: "High-end laptop" } });
    fireEvent.change(priceInput, { target: { value: "1500" } });
    fireEvent.change(qtyInput, { target: { value: "10" } });
    
    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      const [url, formData] = axios.post.mock.calls.find(call => call[0] === "/api/v1/product/create-product");
      expect(formData.get("name")).toBe("Laptop");
      expect(formData.get("price")).toBe("1500");
      expect(formData.get("category")).toBeDefined(); 
    });

 
  });

  test("Admin Menu and layout renders correctly", async () => {
    const {container} = 
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
     
    const pageHeader = screen.getByRole("heading", { name: /create product/i, level: 1 });
    expect(pageHeader).toBeInTheDocument();
  
    const menu = container.querySelector(".list-group.dashboard-menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    
  });
});
  
