// Xenos Fiorenzo Anong, A0257672U
import React from "react";
import { render, waitFor, cleanup, fireEvent, prettyDOM, screen } from "@testing-library/react";
import CartPage from "./CartPage";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { CartProvider, useCart } from "../context/cart";
import { AuthProvider, useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { SearchProvider } from "../context/search";

// mock/stub external dependencies
const paymentInstance = {
  requestPaymentMethod: () =>
    Promise.resolve({
      nonce: "aa",
    }),
};
jest.mock("braintree-web-drop-in-react", () => {
  return ({ options, onInstance }) => {
    onInstance(paymentInstance);
    return <div>Mocked Braintree DropIn</div>;
  };
});

const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
}));

jest.mock("react-hot-toast");

jest.mock("axios");
// mock payment token
axios.get.mockResolvedValue({ data: { clientToken: "token" } });
// mock payment result
axios.post.mockResolvedValue({ data: {} });

afterEach(() => cleanup());
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

const setPopulatedCart = () => {
  localStorage.setItem(
    "cart",
    JSON.stringify([{ name: "product 1", description: "product description 1", price: 67.67 }]),
  );
};
const setEmptyCart = () => {
  localStorage.setItem("cart", JSON.stringify([]));
};

const setUnauthenticated = () => {
  localStorage.removeItem("auth");
};

const setAuthenticatedWithoutAddress = () => {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      user: { name: "John Smith", address: "" },
      token: "token",
    }),
  );
};
const setAuthenticatedWithAddress = () => {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      user: { name: "John Smith", address: "123 Test Drive" },
      token: "token",
    }),
  );
};

describe("Integration between CartPage and auth, cart, search contexts", () => {
  describe("Greeting", () => {
    it("should display Hello Guest if not authenticated", () => {
      setUnauthenticated();
      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(screen.getByText("Hello Guest")).toBeInTheDocument();
    });

    it("should display correct name if authenticated", () => {
      setAuthenticatedWithAddress();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(screen.getByText("Hello John Smith")).toBeInTheDocument();
    });

    it("should display correct message if cart is empty", () => {
      setEmptyCart();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(screen.getByText("Your Cart Is Empty")).toBeInTheDocument();
    });

    it("should display correct message if unauthenticated and cart is populated", () => {
      setUnauthenticated();
      setPopulatedCart();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(
        screen.getByText("You Have 1 items in your cart please login to checkout !"),
      ).toBeInTheDocument();
    });

    it("should display correct message if authenticated and cart is populated", () => {
      setAuthenticatedWithAddress();
      setPopulatedCart();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(screen.getByText("You Have 1 items in your cart")).toBeInTheDocument();
    });
  });

  describe("Cart Summary", () => {
    describe("Total Price", () => {
      it("should display total price correctly if cart is empty", () => {
        setEmptyCart();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.getByText("Total : $0.00")).toBeInTheDocument();
      });

      it("should display total price correctly if cart is populated", () => {
        setPopulatedCart();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.getByText("Total : $67.67")).toBeInTheDocument();
      });
    });

    describe("Checkout", () => {
      it("should display login button if not authenticated", () => {
        setUnauthenticated();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.getByText("Please Login to checkout")).toBeInTheDocument();
      });

      it("should not display login button if authenticated", () => {
        setAuthenticatedWithAddress();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.queryByText("Please Login to checkout")).not.toBeInTheDocument();
      });

      it("should display correct address if authenticated with address", () => {
        setAuthenticatedWithAddress();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.getByText("Current Address")).toBeInTheDocument();
        expect(screen.getByText("123 Test Drive")).toBeInTheDocument();
        expect(screen.getByText("Update Address")).toBeInTheDocument();
      });

      it("should not display address if authenticated with no address", () => {
        setAuthenticatedWithoutAddress();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.queryByText("Current Address")).not.toBeInTheDocument();
        expect(screen.queryByText("Update Address")).toBeInTheDocument();
      });

      it("should not display address if not authenticated", () => {
        setUnauthenticated();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        expect(screen.queryByText("Current Address")).not.toBeInTheDocument();
        expect(screen.queryByText("Update Address")).not.toBeInTheDocument();
      });
    });

    describe("Payment", () => {
      it("should display enabled payment button if authenticated with address and cart is populated", async () => {
        setAuthenticatedWithAddress();
        setPopulatedCart();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );
        expect(await screen.findByText("Mocked Braintree DropIn")).toBeInTheDocument();

        expect(screen.getByText("Make Payment")).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText("Make Payment")).toBeEnabled());
      });

      it("should display disabled payment button if authenticated with address and cart is populated", async () => {
        setAuthenticatedWithoutAddress();
        setPopulatedCart();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );
        expect(await screen.findByText("Mocked Braintree DropIn")).toBeInTheDocument();

        expect(screen.getByText("Make Payment")).toBeInTheDocument();
        expect(screen.getByText("Make Payment")).not.toBeEnabled();
      });

      it("should not display payment if authenticated and cart is empty", async () => {
        setAuthenticatedWithAddress();
        setEmptyCart();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        await waitFor(() => expect(screen.queryByText("Make Payment")).not.toBeInTheDocument());
      });

      it("should not display payment if not authenticated", async () => {
        setUnauthenticated();

        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </MemoryRouter>,
        );

        await waitFor(() => expect(screen.queryByText("Make Payment")).not.toBeInTheDocument());
      });
    });
  });

  describe("Remove cart item", () => {
    it("should update cart correctly after removing item", async () => {
      setPopulatedCart();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Remove"));
      expect(localStorage.getItem("cart")).toBe("[]");
    });
  });

  describe("Handle Payment", () => {
    it("should reset loading status on payment error", async () => {
      setAuthenticatedWithAddress();
      setPopulatedCart();
      axios.post.mockRejectedValueOnce({ data: "" });

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );
      expect(await screen.findByText("Mocked Braintree DropIn")).toBeInTheDocument();

      const payBtn = screen.getByText("Make Payment");
      expect(payBtn).toBeInTheDocument();
      expect(payBtn).toBeEnabled();

      fireEvent.click(payBtn);

      const processingBtn = await screen.findByText("Processing ....");
      expect(processingBtn).toBeInTheDocument();
      expect(processingBtn).toBeDisabled();
      await waitFor(() => expect(axios.post).toHaveBeenCalled());

      const payBtnAfter = await screen.findByText("Make Payment");
      expect(payBtnAfter).toBeInTheDocument();
      expect(payBtnAfter).toBeEnabled();
    });

    it("should handle payment correctly", async () => {
      setAuthenticatedWithAddress();
      setPopulatedCart();

      render(
        <MemoryRouter initialEntries={["/cart"]}>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Routes>
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </MemoryRouter>,
      );
      expect(await screen.findByText("Mocked Braintree DropIn")).toBeInTheDocument();

      const payBtn = screen.getByText("Make Payment");
      expect(payBtn).toBeInTheDocument();
      expect(payBtn).toBeEnabled();

      fireEvent.click(payBtn);

      const processingBtn = await screen.findByText("Processing ....");
      expect(processingBtn).toBeInTheDocument();
      expect(processingBtn).toBeDisabled();
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(localStorage.getItem("cart")).toBeNull();
      expect(mockUseNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
      expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
    });
  });
});
