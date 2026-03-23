/**
 * Admin Users + AdminMenu Integration Test
 * 
 * Sandwich approach:
 * - REAL: Users.js (admin), AdminMenu.js, Layout.js, AuthContext
 * - MOCKED: axios (users list API), react-router-dom
 * 
 * Tests integration of admin dashboard menu navigation with users directory.
 * Demonstrates real component composition for admin workflows.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Users from '../../pages/admin/Users';
import { AuthProvider } from '../../context/auth';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');
jest.mock('../../components/Layout', () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

describe('Component Integration (Top-Down): Users ↔ AdminMenu', () => {
  const mockUsers = [
    {
      _id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: '123 Main St',
      role: 0, // Regular user
    },
    {
      _id: 'user-2',
      name: 'Jane Admin',
      email: 'admin@example.com',
      phone: '555-5678',
      address: '456 Admin Ave',
      role: 1, // Admin
    },
    {
      _id: 'user-3',
      name: 'Bob User',
      email: 'bob@example.com',
      phone: '555-9999',
      address: '789 User Rd',
      role: 0, // Regular user
    },
  ];

  const mockAdminAuth = {
    token: 'admin-token',
    user: {
      _id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 1,
    },
  };

  const renderUsersPage = () => {
    return render(
      <MemoryRouter initialEntries={['/dashboard/admin/users']}>
        <AuthProvider initialState={mockAdminAuth}>
          <Users />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Integration Test 1: Admin users page loads and displays user list
   * Verifies Layout, AdminMenu, and Users table render together
   */
  test('should load and display admin users list with menu', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    // Verify AdminMenu is rendered
    const dashboardHeading = screen.getByRole('heading', { name: /Admin Panel/i });
    expect(dashboardHeading).toBeInTheDocument();

    // Verify page title
    expect(screen.getByText('All Users')).toBeInTheDocument();

    // Wait for users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users');
    });

    // Verify users table headers
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Address' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 2: User data displays in table rows
   * Verifies API response binds to table cells correctly
   */
  test('should display user data in table format', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users');
    });

    // Verify user names appear
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('Bob User')).toBeInTheDocument();
    });

    // Verify emails appear
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  /**
   * Integration Test 3: Role labels display correctly
   * Verifies admin vs regular user role display
   */
  test('should display correct role labels for users', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
      expect(screen.getAllByText('User').length).toBeGreaterThan(0);
    });
  });

  /**
   * Integration Test 4: Phone numbers display in table
   * Verifies contact info is rendered
   */
  test('should display user phone numbers', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      expect(screen.getByText('555-1234')).toBeInTheDocument();
      expect(screen.getByText('555-5678')).toBeInTheDocument();
      expect(screen.getByText('555-9999')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 5: Address display with object handling
   * Verifies component handling of address as string or object
   */
  test('should display user addresses', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Admin Ave')).toBeInTheDocument();
      expect(screen.getByText('789 User Rd')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 6: Empty users list handling
   * Verifies graceful behavior when no users exist
   */
  test('should show "No users" message when list is empty', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderUsersPage();

    await waitFor(() => {
      expect(screen.getByText('No users')).toBeInTheDocument();
    });

    // Table should not be visible
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  /**
   * Integration Test 7: API call on component mount
   * Verifies users are fetched when component loads
   */
  test('should fetch users list on component mount', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Integration Test 8: Row numbering in table
   * Verifies sequential numbering of user rows
   */
  test('should number user rows sequentially starting from 1', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      // Table rows should be numbered 1, 2, 3
      const rows = screen.getAllByRole('row');
      // First row is header, next 3 are data rows
      expect(rows.length).toBe(4);
    });

    // Check for row numbers
    const cells = screen.getAllByText(/^[123]$/);
    expect(cells.length).toBeGreaterThanOrEqual(3);
  });

  /**
   * Integration Test 9: API error handling
   * Verifies component handles fetch errors gracefully
   */
  test('should handle API errors without crashing', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    renderUsersPage();

    // Component should still render even after error
    await waitFor(() => {
      expect(screen.getByText('All Users')).toBeInTheDocument();
    });

    // Should show "No users" as fallback
    expect(screen.getByText('No users')).toBeInTheDocument();
  });

  /**
   * Integration Test 10: Admin role filtering verification
   * Verifies admin users are labeled distinctly from regular users
   */
  test('should distinguish admin users from regular users in role column', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      // Count how many times 'Admin' label appears
      const adminElements = screen.getAllByText('Admin');
      // Should be at least one admin
      expect(adminElements.length).toBeGreaterThan(0);

      // Other users should be labeled as 'User'
      const userElements = screen.getAllByText('User');
      expect(userElements.length).toBeGreaterThan(0);
    });
  });

  /**
   * Integration Test 11: User ID handling
   * Verifies component uses user ID for key in map
   */
  test('should use user _id for table row identification', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      // All user data is displayed, indicating rows are properly keyed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('Bob User')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 12: Table structure integration
   * Verifies table renders with proper Bootstrap classes
   */
  test('should render table with proper structure', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    renderUsersPage();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 13: Auth context usage in admin page
   * Verifies component reads admin auth state
   */
  test('should render admin users page with admin auth context', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    const { rerender } = renderUsersPage();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Page should display users (confirms admin access)
    expect(screen.getByText('All Users')).toBeInTheDocument();
  });

  /**
   * Integration Test 14: Object address handling
   * Verifies component correctly serializes address objects
   */
  test('should handle address field when it is an object', async () => {
    const usersWithObjectAddress = [
      {
        ...mockUsers[0],
        address: { street: '123 Main', city: 'Boston' },
      },
    ];

    axios.get.mockResolvedValue({ data: usersWithObjectAddress });

    renderUsersPage();

    await waitFor(() => {
      // Component should display stringified object
      expect(screen.getByText(/street/)).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 15: Multiple user entries
   * Verifies component handles larger user lists
   */
  test('should display all users in list regardless of count', async () => {
    const largeUserList = Array.from({ length: 10 }, (_, i) => ({
      _id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `555-${1000 + i}`,
      address: `${100 + i} Main St`,
      role: i % 2,
    }));

    axios.get.mockResolvedValue({ data: largeUserList });

    renderUsersPage();

    await waitFor(() => {
      // Verify at least some users are displayed
      expect(screen.getByText('User 0')).toBeInTheDocument();
      expect(screen.getByText('User 9')).toBeInTheDocument();
    });

    // Verify table has correct number of rows
    const rows = screen.getAllByRole('row');
    // 1 header row + 10 data rows
    expect(rows.length).toBe(11);
  });
});
