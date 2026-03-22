//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import React, { useEffect} from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { AuthProvider, useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";

jest.mock("axios");
jest.mock("../../components/Header", () => () => <div>Header</div>);
jest.mock("../../components/Footer", () => () => <div>Footer</div>);


jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  success: jest.fn(),
  error: jest.fn(),
}));

describe("AdminOrders full integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("orders appear correctly for admin", async () => {
    const AuthWrapper = ({ children }) => {
        const [, setAuth] = useAuth();
        useEffect(() => {
        setAuth({
            token: "fake-admin-token",
            user: { role: "admin", name: "Admin User" },
        });
        }, [setAuth]);
        return children;
    };

    const mockOrders = [
        {
        _id: "order1",
        status: "Not Process",
        buyer: { name: "Alice" },
        createdAt: new Date(),
        payment: { success: true },
        products: [
            { _id: "prod1", name: "Gaming Laptop", description: "High-end laptop", price: 2500 },
        ],
        },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <AuthWrapper>
              <AdminOrders />
            </AuthWrapper>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
  });

  test("admin can update order status, order status updated correctly", async () => {
    const AuthWrapper = ({ children }) => {
        const [, setAuth] = useAuth();
        useEffect(() => {
        setAuth({
            token: "fake-admin-token",
            user: { role: "admin", name: "Admin User" },
        });
        }, [setAuth]);
        return children;
      };

    const mockOrders = [
        {
        _id: "order1",
        status: "Not Process",
        buyer: { name: "Alice" },
        createdAt: new Date(),
        payment: { success: true },
        products: [
            { _id: "prod1", name: "Gaming Laptop", description: "High-end laptop", price: 2500 },
        ],
        },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <AuthWrapper>
              <AdminOrders />
            </AuthWrapper>
          </AuthProvider>
        </MemoryRouter>
      );
    });

    const selectTrigger = await screen.findByText("Not Process", { selector: ".ant-select-selection-item" });
    fireEvent.mouseDown(selectTrigger);

    const shippedOption = await screen.findByText(
        (content, element) =>
        element.classList.contains("ant-select-item-option-content") && content === "Shipped"
    );

    await act(async () => fireEvent.click(shippedOption));

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", { status: "Shipped" });
    });

    const visibleShipped = screen.getAllByText("Shipped").filter(el =>
        el.classList.contains("ant-select-selection-item")
    );
    expect(visibleShipped).toHaveLength(1);
    });


  test("does not fetch orders if no auth token", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
              <AdminOrders />
          </AuthProvider>
        </MemoryRouter>
      );
    });

  
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("orders appear with correct layout and admin menu", async () => {
    const AuthWrapper = ({ children }) => {
      const [, setAuth] = useAuth();
      useEffect(() => {
          setAuth({ token: "fake-admin-token", user: { role: "admin", name: "Admin User" } });
      }, [setAuth]);
      return children;
    };

    const mockOrders = [
      {
        _id: "order1",
        status: "Not Process",
        buyer: { name: "Alice" },
        createdAt: new Date(),
        payment: { success: true },
        products: [{ _id: "prod1", name: "Gaming Laptop", description: "High-end laptop", price: 2500 }],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const {container} = 
      render(
        <MemoryRouter>
          <AuthProvider>
            <AuthWrapper>
              <AdminOrders />
            </AuthWrapper>
          </AuthProvider>
        </MemoryRouter>
      );
    

    
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  
    const menu = container.querySelector(".list-group.dashboard-menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();

    const buyer = await screen.findByText("Alice");
    expect(buyer).toBeInTheDocument();


    const product = await screen.findByText("Gaming Laptop");
    expect(product).toBeInTheDocument();
    
});
});