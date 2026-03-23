// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails.js';
import CartPage from './CartPage.js';
import { CartProvider } from '../context/cart.js';
import { SearchProvider } from '../context/search.js';
import { AuthProvider } from '../context/auth.js';

jest.mock('axios');

const mockCategory = { _id: 'cat1', name: 'Clothing' };

const mockProduct = {
  _id: 'p1',
  name: 'NUS T-shirt',
  price: 4.99,
  description: 'Plain NUS T-shirt for sale',
  slug: 'nus-t-shirt',
  category: mockCategory,
};

const mockRelatedProduct = {
  _id: 'p2',
  name: 'White Shirt',
  price: 20.00,
  description: 'White Shirt for sale',
  slug: 'white-shirt',
  category: mockCategory,
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Setup

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  // M3 stubbed — all axios calls return controlled data
  axios.get.mockImplementation(url => {
    if (url.includes('get-product'))     return Promise.resolve({ data: { product: mockProduct } });
    if (url.includes('related-product')) return Promise.resolve({ data: { products: [mockRelatedProduct] } });
    if (url.includes('product-photo'))   return Promise.resolve({ data: {} });
    if (url.includes('braintree/token')) return Promise.resolve({ data: { clientToken: 'fake' } });
    if (url.includes('get-category'))    return Promise.resolve({ data: { success: true, category: [] } });
    return Promise.reject(new Error(`Unexpected GET: ${url}`));
  });
});

// Helpers 
// Step 1 helper — M2 + M4 only, no M1
const renderCartPageOnly = () =>
  render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>              {/* M2 — real CartContext */}
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />  {/* M4 */}
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// Step 2 helper — M1 + M2, no M4
const renderPDP = (slug = 'nus-t-shirt') =>
  render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>              {/* M2 — real CartContext */}
          <MemoryRouter initialEntries={[`/product/${slug}`]}>
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />  {/* M1 */}
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// Step 2 M1+M2+M4 helper — M1 + M2 + M4 all real
const renderPDPWithCart = (slug = 'nus-t-shirt') =>
  render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>              {/* M2 — real CartContext shared between M1 and M4 */}
          <MemoryRouter initialEntries={[`/product/${slug}`]}>
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />  {/* M1 */}
              <Route path="/cart"          element={<CartPage />} />         {/* M4 */}
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// ProductDetails Integration Test -- Step 1 (Bottom-Up): M2 CartContext + M4 CartPage cluster
// Note: individual M4 behaviour already covered by CartPage.test.js
describe('ProductDetails Integration Test - Step 1 (Bottom-Up): M2 CartContext + M4 CartPage cluster', () => {
  test('M2+M4: CartPage renders items when real M2 CartContext initialised from localStorage', async () => {
    // Seed M2 via localStorage — real CartProvider reads this on init
    localStorage.setItem('cart', JSON.stringify([
      { _id: 'p1', name: 'NUS T-shirt', price: 4.99, description: 'T-shirt' }
    ]));

    renderCartPageOnly();

    await waitFor(() => {
      // M4 correctly renders what real M2 CartContext provided
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText(/You Have 1 items in your cart/)).toBeInTheDocument();
      expect(screen.getByText('Cart Summary')).toBeInTheDocument();
    });
  });

  test('M2+M4: CartPage shows empty state when real M2 CartContext has no items', async () => {
    // No localStorage — M2 CartProvider initialises empty
    renderCartPageOnly();

    await waitFor(() => {
      // M4 correctly reflects empty M2 CartContext state
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
    });
  });

  test('M2+M4: Remove in M4 correctly updates real M2 CartContext and localStorage', async () => {
    localStorage.setItem('cart', JSON.stringify([
      { _id: 'p1', name: 'NUS T-shirt', price: 4.99, description: 'T-shirt' }
    ]));

    renderCartPageOnly();

    await screen.findByText('NUS T-shirt');

    // Remove in M4 — should call real M2 CartContext setCart
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      // M4 reflects updated M2 CartContext state
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
      // Verify real M2 CartContext persisted removal to localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      expect(cart).toHaveLength(0);
    });
  });
});

// ProductDetails Integration Test -- Step 2 (Top-Down): M1 real, M2 real, M3 stubbed
describe('ProductDetails Integration Test - Step 2 (Top-Down): M1 ProductDetails with M2 real, M3 stubbed', () => {
  test('M1: renders product name, description, category from M3 stub', async () => {
    renderPDP();

    // Wait for both product AND related products — ensures all M3 stubs resolved
    await screen.findByText('White Shirt');

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { level: 6 });
      const texts = headings.map(h => h.textContent);

      // M1 correctly renders data returned by M3 stub
      expect(texts.some(t => t.includes('NUS T-shirt') && t.includes('Name'))).toBe(true);
      expect(texts.some(t => t.includes('Plain NUS T-shirt for sale'))).toBe(true);
      expect(texts.some(t => t.includes('Clothing'))).toBe(true);
    });

    // Verify M3 was called with slug provided by Router
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('get-product/nus-t-shirt')
    );
  });

  test('M1: renders related products from M3 stub', async () => {
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText('White Shirt')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('related-product')
    );
  });

  test('M1: shows no similar products message when M3 returns empty array', async () => {
    // Override M3 stub to return empty related products
    axios.get.mockImplementation(url => {
      if (url.includes('get-product'))     return Promise.resolve({ data: { product: mockProduct } });
      if (url.includes('related-product')) return Promise.resolve({ data: { products: [] } });
      if (url.includes('get-category'))    return Promise.resolve({ data: { success: true, category: [] } });
      return Promise.resolve({ data: {} });
    });

    renderPDP();

    await waitFor(() => {
      expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
    });
  });

  test('M1+M2: ADD TO CART on main product updates real M2 CartContext and localStorage', async () => {
    renderPDP();

    await screen.findByText('White Shirt');

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0);
    });

    // Verify real M2 CartContext persisted main product to localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('NUS T-shirt');
    expect(cart[0].price).toBe(4.99);
  });

  test('M1+M2: ADD TO CART on related product updates real M2 CartContext', async () => {
    renderPDP();

    await screen.findByText('White Shirt');

    // Click ADD TO CART on related product
    const addToCartButtons = screen.getAllByRole('button', { name: 'ADD TO CART' });
    fireEvent.click(addToCartButtons[addToCartButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0);
    });

    // Verify real M2 CartContext stored related product, not main product
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('White Shirt');
    expect(cart[0].price).toBe(20.00);
  });

  test('M1+M2+M4: product added in M1 appears in M4 via shared M2', async () => {
    renderPDPWithCart();

    await screen.findAllByText(/NUS T-shirt/);

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0);
    });

    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('NUS T-shirt');

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M4 reflects what M1 added via shared M2
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText(/You Have 1 items in your cart/)).toBeInTheDocument();
    });
  });

  test('M1+M2+M4: cart total in M4 matches price shown in M1', async () => {
    renderPDPWithCart();

    await screen.findAllByText(/NUS T-shirt/);

    // Read price from M1 before navigating
    const headings = screen.getAllByRole('heading', { level: 6 });
    const priceHeading = headings.find(h => h.textContent.includes('Price'));
    const priceFromM1 = parseFloat(priceHeading.textContent.replace(/[^0-9.]/g, ''));

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M4 total should match price M1 showed — both reading from same M2
      const totalText = screen.getByText(/Total :/).textContent;
      const totalInM4 = parseFloat(totalText.replace(/[^0-9.]/g, ''));
      expect(totalInM4).toBeCloseTo(priceFromM1, 2);
    });
  });

  test('M1+M2+M4: main and related product added in M1 both appear in M4', async () => {
    renderPDPWithCart();

    await screen.findByText('White Shirt');

    const addToCartButtons = screen.getAllByRole('button', { name: 'ADD TO CART' });

    fireEvent.click(addToCartButtons[0]);
    await waitFor(() =>
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0)
    );

    fireEvent.click(addToCartButtons[addToCartButtons.length - 1]);
    await waitFor(() =>
      expect(screen.getAllByText('Item Added to cart').length).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M4 reflects both products added via shared M2
      expect(screen.getByText(/You Have 2 items in your cart/)).toBeInTheDocument();
    });
  });
});