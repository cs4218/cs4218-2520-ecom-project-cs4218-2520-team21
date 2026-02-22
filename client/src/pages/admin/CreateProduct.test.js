//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast"


jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));


jest.mock("../../components/AdminMenu", () => () => <div>Mocked AdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe("CreateProduct test", () => {
  const categoriesMock = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { success: true, category: categoriesMock } });
    axios.post.mockResolvedValue({ data: { success: true } });
    global.URL.createObjectURL = jest.fn(() => "mocked-url");
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL.mockReset();
  });

  test("renders basic layout and form fields", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/Dashboard - Create Product/i)).toBeInTheDocument();
    expect(screen.getByText("Mocked AdminMenu")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
  });

  test("fetches and displays categories in the dropdown", async () => {
    
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      const selectPlaceholder = screen.getByText("Select a category");
      fireEvent.mouseDown(selectPlaceholder);
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();

    });
  });

  test("typing into input fields updates state", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    const nameInput = screen.getByPlaceholderText("write a name");
    const descInput = screen.getByPlaceholderText("write a description");
    const priceInput = screen.getByPlaceholderText("write a Price");
    const qtyInput = screen.getByPlaceholderText("write a quantity");

    fireEvent.change(nameInput, { target: { value: "Laptop" } });
    fireEvent.change(descInput, { target: { value: "High-end laptop" } });
    fireEvent.change(priceInput, { target: { value: "1500" } });
    fireEvent.change(qtyInput, { target: { value: "10" } });

    expect(nameInput.value).toBe("Laptop");
    expect(descInput.value).toBe("High-end laptop");
    expect(priceInput.value).toBe("1500");
    expect(qtyInput.value).toBe("10");
});


  test("calls create product api", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByPlaceholderText("write a name"), { target: { value: "Laptop" } });
    
    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });
  });


  test("updates category state when a category is selected", async () => {
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const selectCategory = await screen.findByText("Select a category");
    fireEvent.mouseDown(selectCategory);
    const option = await screen.findByText("Electronics");
    fireEvent.click(option);
    expect(screen.getAllByText("Electronics").length).toBeGreaterThanOrEqual(1);
  });

  test("handles successful API response correctly", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("updates shipping state when select value changes", async () => {
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const shippingSelect = screen.getByText("Select Shipping");
    fireEvent.mouseDown(shippingSelect);
    
    const yesOption = screen.getByText("Yes");
    fireEvent.click(yesOption);

    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.post.mock.calls[0][1];
      expect(formData.get("shipping")).toBe("1"); 
    });
});

  test("shows toast error when fetching categories fails", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(<CreateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
  });
    logSpy.mockRestore();
});

  test("shows toast error when creating product fails", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error("Server error"));

    render(<CreateProduct />);

    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
  });
    logSpy.mockRestore();
});

  test("shows error toast when server returns success false on creation", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Product name already exists" }
    });

    render(<MemoryRouter><CreateProduct /></MemoryRouter>);

    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Product name already exists");
    });
  });

  test("uploads photo and shows preview and filename successfully", async () => {
    render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );

    const file = new File(["dummy"], "laptop.png", { type: "image/png" });
    const uploadInput = screen.getByLabelText(/upload photo/i);

    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("product_photo")).toBeInTheDocument();
      expect(screen.getByText("laptop.png")).toBeInTheDocument();
      expect(screen.queryByText("Upload Photo")).not.toBeInTheDocument();
    });
  });


  test("does not show preview when no image is selected", async () => {
    render(
        <MemoryRouter>
          <CreateProduct />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.queryByAltText("product_photo")).toBeNull();
        expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    });
  });
});