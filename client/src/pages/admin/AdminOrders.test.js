//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import AdminOrders from "./AdminOrders"; 
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom";

jest.mock("axios");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu Mock</div>);
jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));


describe("AdminOrders test", () => {
  const mockOrders = [
  {
    _id: "order123",
    status: "Not Process",
    buyer: { name: "John Doe" },
    createdAt: new Date().toISOString(),
    payment: { success: true },
    products: [
      {
        _id: "p1",
        name: "Product 1",
        description: "A great product description",
        price: 100,
      },
    ],
  },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders AdminOrders and fetches data", async () => {
    render(<AdminOrders />);

    expect(screen.getByText("All Orders Data")).toBeInTheDocument();

    const buyerName = await screen.findByText("John Doe");
    expect(buyerName).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
  });

  test("updates order status when selection changes", async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    
    render(<AdminOrders />);

    await waitFor(() => screen.getByText("Not Process"));

    const selectDropdown = screen.getByText("Not Process");
    fireEvent.mouseDown(selectDropdown); 

    const shippedOption = await screen.findByText("Shipped");
    fireEvent.click(shippedOption);

   
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order123",
        { status: "Shipped" }
      );
    });
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test("displays 'Failed' if payment success is false", async () => {
    const failedOrder = [{ ...mockOrders[0], payment: { success: false } }];
    axios.get.mockResolvedValue({ data: failedOrder });

    render(<AdminOrders />);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });

  test("displays 'Success' if payment success is true", async () => {
    const successOrder = [{ ...mockOrders[0], payment: { success: true } }];
    axios.get.mockResolvedValue({ data: successOrder });

    render(<AdminOrders />);

    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });

  test("renders correctly when there are no orders", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<AdminOrders />);
    
    await waitFor(() => {
    
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  test("does not fetch orders if auth token is missing", () => {
    useAuth.mockReturnValue([{}, jest.fn()]); 
    
    render(<AdminOrders />);

    expect(axios.get).not.toHaveBeenCalled();
  });

  test("logs error to console when API call fails", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValue(new Error("Network Error"));

    render(<AdminOrders />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  test("handle Change handles errors", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    axios.put.mockRejectedValue(new Error("Update Failed"));

    render(<AdminOrders />);
    
    const statusDropdown = await screen.findByText("Not Process");
    fireEvent.mouseDown(statusDropdown);
    fireEvent.click(await screen.findByText("Shipped"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });


  test("truncates product description to 30 characters", async () => {
    const longDescription = "This is a very long description that definitely exceeds thirty characters to test truncation.";
    const expectedTruncation = longDescription.substring(0, 30); // "This is a very long descriptio"

    const mockOrdersWithLongDesc = [
      {
        _id: "order456",
        status: "Not Process",
        buyer: { name: "Jane Doe" },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [
          {
            _id: "p2",
            name: "Long Desc Product",
            description: longDescription,
            price: 50,
          },
        ],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrdersWithLongDesc });

    render(<AdminOrders />);
    const truncatedText = await screen.findByText(new RegExp(expectedTruncation, "i"));
    
    expect(truncatedText).toBeInTheDocument();
    expect(screen.queryByText(longDescription)).not.toBeInTheDocument();
});
});