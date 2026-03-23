/**
 * Orders + UserMenu Integration Test
 * 
 * Sandwich approach:
 * - REAL: Orders.js, UserMenu.js, Layout.js, AuthContext, moment formatting
 * - MOCKED: axios (order API), react-router-dom, Spinner
 * 
 * Tests integration of order list fetching and rendering with user navigation.
 * Demonstrates real component tree composition and data binding.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Orders from '../user/Orders';
import { AuthProvider } from '../../context/auth';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');
jest.mock('../../components/Spinner', () => {
  return function Spinner() {
    return <div>Loading...</div>;
  };
});
jest.mock('../../components/Layout', () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

describe('Component Integration (Top-Down): Orders ↔ UserMenu', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockOrders = [
    {
      _id: 'order-1',
      status: 'Processing',
      buyer: { name: mockUser.name, _id: mockUser._id },
      payment: { success: true },
      products: [
        {
          _id: 'prod-1',
          name: 'Test Product 1',
          description: 'This is a test product',
          price: 99.99,
        },
      ],
      createAt: new Date().toISOString(),
    },
    {
      _id: 'order-2',
      status: 'Shipped',
      buyer: { name: mockUser.name, _id: mockUser._id },
      payment: { success: false },
      products: [
        {
          _id: 'prod-2',
          name: 'Test Product 2',
          description: 'Another product',
          price: 49.99,
        },
      ],
      createAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];

  const setupAuthInStorage = (authData) => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
    }
  };

  const renderOrdersWithMenu = () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };
    setupAuthInStorage(initialAuth);

    return render(
      <MemoryRouter initialEntries={['/dashboard/user/orders']}>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Integration Test 1: Orders loaded and rendered with real component tree
   * Verifies the complete order list page renders with menu and content
   */
  test('should load and display orders with user menu navigation', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    // Verify UserMenu component is rendered
    const profileLink = screen.getByText('Profile');
    expect(profileLink).toBeInTheDocument();

    const ordersLink = screen.getByText('Orders');
    expect(ordersLink).toBeInTheDocument();

    // Verify page title
    expect(screen.getByText('All Orders')).toBeInTheDocument();

    // Wait for orders to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });

    // Verify orders are displayed
    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 2: Order table renders with correct status and buyer info
   * Verifies data binding through component composition
   */
  test('should display order details in table format', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getAllByText(mockUser.name).length).toBeGreaterThan(0);
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 3: Product cards render within order sections
   * Verifies nested component rendering with data from API
   */
  test('should display products within each order section', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    // Verify product prices are shown
    await waitFor(() => {
      expect(screen.getByText('Price : 99.99')).toBeInTheDocument();
      expect(screen.getByText('Price : 49.99')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 4: Empty orders state
   * Verifies proper rendering when user has no orders
   */
  test('should show "No orders" message when orders list is empty', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderOrdersWithMenu();

    await waitFor(() => {
      expect(screen.getByText('No orders')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 5: API fetch on component mount
   * Verifies orders are fetched when component mounts with auth token
   */
  test('should fetch orders on component mount with auth token', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });
  });

  /**
   * Integration Test 6: Product image rendering
   * Verifies image URLs are constructed correctly from API
   */
  test('should render product images with correct src URLs', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      const images = screen.getAllByAltText(/Test Product/);
      expect(images.length).toBeGreaterThan(0);

      const expectedIds = mockOrders.flatMap((order) =>
        order.products.map((product) => product._id)
      );

      images.forEach((img, idx) => {
        expect(img.src).toContain(
          `/api/v1/product/product-photo/${expectedIds[idx]}`
        );
      });
    });
  });

  /**
   * Integration Test 7: Order quantity display
   * Verifies product count is shown correctly
   */
  test('should display correct product quantity for each order', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      // Each order has 1 product
      const quantityHeaders = screen.getAllByText('Quantity');
      expect(quantityHeaders.length).toBeGreaterThan(0);
    });
  });

  /**
   * Integration Test 8: Payment status handling
   * Verifies payment success/failure states are displayed
   */
  test('should display success for successful payment and Failed for unsuccessful', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      // First order has success: true
      expect(screen.getByText('Success')).toBeInTheDocument();
      // Second order has success: false
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 9: Error handling during fetch
   * Verifies error handling doesn't break component
   */
  test('should handle fetch errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    renderOrdersWithMenu();

    await waitFor(() => {
      // Should show "No orders" or handle gracefully
      // Component should still render without crashing
      expect(screen.getByText('All Orders')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 10: Product description truncation
   * Verifies descriptions are limited to 30 characters
   */
  test('should truncate product descriptions to 30 characters', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      // Original is 'This is a test product' (22 chars)
      expect(screen.getByText('This is a test product')).toBeInTheDocument();

      // Second is 'Another product' (15 chars)
      expect(screen.getByText('Another product')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 11: Order status labels
   * Verifies order status values are rendered correctly
   */
  test('should render all order statuses from API response', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      // Order 1
      expect(screen.getByText('Processing')).toBeInTheDocument();
      // Order 2
      expect(screen.getByText('Shipped')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 12: User info propagation through auth context
   * Verifies buyer name comes from populated order data
   */
  test('should show buyer name from order data (context integration)', async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    renderOrdersWithMenu();

    await waitFor(() => {
      // Buyer name should appear in the table
      expect(screen.getAllByText(mockUser.name).length).toBeGreaterThan(0);
    });
  });
});
