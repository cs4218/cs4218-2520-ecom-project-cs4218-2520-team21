// Xenos Fiorenzo Anong, A0257672U
import React, { useEffect } from "react";
import { renderHook, render, cleanup, waitFor, screen } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

afterEach(() => cleanup());
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Cart Context", () => {
  it("should read existing cart from local storage", async () => {
    const existingCart = [
      { name: "product 1", description: "product description 1", price: 67.67 },
    ];
    localStorage.setItem("cart", JSON.stringify(existingCart));
    const TestComponent = () => {
      const [cart, setCart] = useCart();
      return <div>{JSON.stringify(cart)}</div>;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>,
    );

    expect(await screen.findByText(JSON.stringify(existingCart))).toBeInTheDocument();
  });

  it("should ignore empty local storage cart", async () => {
    const currentCart = [{ name: "product 1", description: "product description 1", price: 67.67 }];
    localStorage.setItem("cart", []);
    const TestComponent = () => {
      const [cart, setCart] = useCart();
      useEffect(() => {
        setCart(currentCart);
      }, []);
      return <div>{JSON.stringify(cart)}</div>;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>,
    );

    expect(await screen.findByText(JSON.stringify(currentCart))).toBeInTheDocument();
  });
});
