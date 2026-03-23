// Ariella Thirza Callista, A0255876L
// Claude was used to help structure tests and generate edge cases

/* eslint-disable testing-library/no-wait-for-multiple-assertions */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage.js';
import CartPage from './CartPage.js';
import { CartProvider } from '../context/cart.js';
import { SearchProvider } from '../context/search.js';
import { AuthProvider } from '../context/auth.js';

jest.mock('axios');

const mockCategory = [
  { _id: 'cat1', name: 'Clothing' },
  { _id: 'cat2', name : 'Electronics' }
];
const mockProducts = [
  { _id: 'p1', name: 'NUS T-shirt', price: 4.99,  description: 'T-shirt', slug: 'nus-t-shirt', category: mockCategory[0] },
  { _id: 'p2', name: 'Laptop', price: 20.00, description: 'A powerful laptop',   slug: 'laptop', category: mockCategory[1] },
];

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

  axios.get.mockImplementation(url => {
    if (url.includes('get-category'))    return Promise.resolve({ data: { success: true, category: mockCategory } });
    if (url.includes('product-count'))   return Promise.resolve({ data: { total: 2 } });
    if (url.includes('product-list'))    return Promise.resolve({ data: { products: mockProducts } });
    if (url.includes('braintree/token')) return Promise.resolve({ data: { clientToken: 'fake' } });
    return Promise.reject(new Error(`Unexpected GET: ${url}`));
  });
});

// Helpers
// Step 1 Helper - M2, M5 only no M1
const renderCartPageOnly = () => 
  render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>          {/* M2 — REAL */}
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />  {/* M5 */}
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// Step 2 Helper - M1 + M2
const renderHomePage = () =>
  render(
    <AuthProvider> 
      <SearchProvider>   
        <CartProvider>   
            <MemoryRouter>
              <HomePage />
            </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// Step 2 helper - M1 + M2 + M5
const renderHomePageWithCart = (initialRoute = '/') =>
  render(
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );

// Step 1 (Bottom-Up): Cluster M5 & M2
describe('HomePage integration test - Step 1 (Bottom-Up): M5 CartPage with real M2 CartContext', () => {
  // Unit test covers this with mocked useCart
  // Integration test covers this with REAL CartProvider via localStorage
  test('M5+M2: CartPage renders items when real CartProvider initialised from localStorage', async () => {
    localStorage.setItem('cart', JSON.stringify([
      { _id: 'p1', name: 'NUS T-shirt', price: 4.99, description: 'T-shirt' }
    ]));

    renderCartPageOnly();

    await waitFor(() => {
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText(/You Have 1 items in your cart/)).toBeInTheDocument();
    });
  });

  test('M5+M2: CartPage shows empty state when real CartProvider has no items', async () => {
    // No localStorage set — CartProvider initialises empty
    renderCartPageOnly();
    
    await waitFor(() => {
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
    });
  });

  test('M5+M2: Remove button updates real CartProvider state and localStorage', async () => {
    localStorage.setItem('cart', JSON.stringify([
      { _id: 'p1', name: 'NUS T-shirt', price: 4.99, description: 'T-shirt' }
    ]));

    renderCartPageOnly();

    await screen.findByText('NUS T-shirt');
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
      // Verify real M2 CartProvider updated localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      expect(cart).toHaveLength(0);
    });
  });
});

// Step 2 (Top-Down): Test M1, replace M2, M3 w/ actual, stub M4
describe('HomePage integration test - Step 2 (Top-Down): Test HomePage (M1) with real CartContext (M2), Filter (M3), stubbed API (M4)', () => {
  test('M1: renders product cards on initial load from mocked API (M4)', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });

  test('M1+M3: category filter state drives M4 API call', async () => {
    axios.post.mockResolvedValue({
      data: { products: [mockProducts[0]] },
    });

    renderHomePage();
    await screen.findByRole('checkbox', { name: 'Clothing' });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Clothing' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/product-filters',
        expect.objectContaining({ checked: expect.any(Array) })
      );
      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    });
  });

  test('M1+M3: price filter state drives M4 API call', async () => {
    axios.post.mockResolvedValue({
      data: { products: [mockProducts[0]] },
    });

    renderHomePage();
    await screen.findByRole('radio', { name: '$0 to 19' });

    fireEvent.click(screen.getByRole('radio', { name: '$0 to 19' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/product-filters',
        expect.objectContaining({ radio: expect.any(Array) })
      );
      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    });
  });

  test('M1+M2: ADD TO CART updates real M2 CartContext and localStorage', async () => {
    renderHomePage();
    await screen.findAllByTestId('product-card');

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);

    await waitFor(() => {
      expect(screen.getByText('Item Added to cart')).toBeInTheDocument();
    });

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('NUS T-shirt');
  });

  // M1 + M2 + M5 — full top cluster, M5 already proven in Step 1
  test('M1+M2+M5: product added in M1 appears in M5 via shared M2', async () => {
    renderHomePageWithCart();

    // Wait for M1 to render products from M4 stub
    await screen.findAllByTestId('product-card');

    // Click ADD TO CART — triggers real M2 CartContext setCart
    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);

    // Verify M2 CartContext updated localStorage
    await screen.findAllByText('Item Added to cart');
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('NUS T-shirt');

    // Navigate to M5 CartPage — reads from same real M2 CartContext
    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M5 reflects what M1 added via shared M2
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText(/You Have 1 items in your cart/)).toBeInTheDocument();
    });
  });

  test('M1+M2+M5: cart total in M5 matches price shown in M1', async () => {
    renderHomePageWithCart();

    // Wait for M1 to render products from M4 stub
    await screen.findAllByTestId('product-card');

    // Read price from M1 before navigating
    const priceHeadings = screen.getAllByRole('heading', { level: 5 });
    const priceText = priceHeadings.find(h => h.textContent?.includes('$'))?.textContent;
    const priceFromM1 = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);
    await screen.findAllByText('Item Added to cart');

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M5 total should match price M1 showed — both sourced from same M2 state
      const totalText = screen.getByText(/Total :/).textContent;
      const totalInM5 = parseFloat(totalText.replace(/[^0-9.]/g, ''));
      expect(totalInM5).toBeCloseTo(priceFromM1, 2);
    });
  });

  test('M1+M2+M5: removing item in M5 clears M2 correctly', async () => {
    renderHomePageWithCart();

    // Wait for M1 to render
    await screen.findAllByTestId('product-card');

    fireEvent.click(screen.getAllByRole('button', { name: 'ADD TO CART' })[0]);
    await screen.findAllByText('Item Added to cart');

    fireEvent.click(screen.getByRole('link', { name: /cart/i }));
    await screen.findByText('NUS T-shirt');

    // Remove item in M5 — should update real M2 CartContext
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      // M5 reflects empty state after M2 CartContext cleared
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();

      // Verify real M2 CartContext cleared localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      expect(cart).toHaveLength(0);
    });
  });

  test('M1+M3+M2+M5: filtered product added to cart appears correctly in M5', async () => {
    // M3 filter logic in M1 drives M4 stub to return filtered products
    // M4 stub returns only NUS T-shirt after category filter applied
    axios.post.mockResolvedValue({
      data: { products: [mockProducts[0]] },
    });

    renderHomePageWithCart();

    await screen.findByRole('checkbox', { name: 'Clothing' });

    // Trigger M3 filter logic in M1
    fireEvent.click(screen.getByRole('checkbox', { name: 'Clothing' }));

    // Wait for M1 to update with filtered results from M4 stub via M3
    await waitFor(() =>
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    );

    // Verify M1 only shows filtered product
    expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();

    // Add filtered product via M1 - real M2 CartContext
    fireEvent.click(screen.getByRole('button', { name: 'ADD TO CART' }));
    await screen.findAllByText('Item Added to cart');

    // Verify real M2 CartContext has the filtered product
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('NUS T-shirt');

    // Navigate to M5 — should show the filtered product that was added
    fireEvent.click(screen.getByRole('link', { name: /cart/i }));

    await waitFor(() => {
      // M5 correctly shows product that came through M3 filter → M4 stub → M1 → M2
      expect(screen.getByText('NUS T-shirt')).toBeInTheDocument();
      expect(screen.getByText(/You Have 1 items in your cart/)).toBeInTheDocument();
    });
  });
});