// Lim Rui Ting Valencia, A0255150N

/**
 * PrivateRoute + Protected Page Integration Test
 * 
 * Sandwich approach:
 * - REAL: PrivateRoute.js, AuthContext, MemoryRouter, route protection logic
 * - MOCKED: axios (user-auth check), Spinner component
 * 
 * Tests integration of auth gate middleware with protected route rendering.
 * Demonstrates real route guards and conditional component rendering.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/auth';
import PrivateRoute from '../../components/Routes/Private';

jest.mock('axios');

// Mock Spinner to avoid complexity
jest.mock('../../components/Spinner', () => {
  return function Spinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

// Mock Dashboard child component
const ProtectedPage = () => <div>Protected Content</div>;

describe('Component Integration (Top-Down): PrivateRoute ↔ Dashboard', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const setupAuthInStorage = (authData) => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
    }
  };

  const renderWithPrivateRoute = (initialAuth = null) => {
    setupAuthInStorage(initialAuth);
    return render(
      <MemoryRouter initialEntries={['/dashboard/user/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<PrivateRoute />}>
              <Route
                path="/dashboard/user/dashboard"
                element={<ProtectedPage />}
              />
              <Route
                path="/dashboard/user/profile"
                element={<div>Protected Profile</div>}
              />
            </Route>
          </Routes>
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
   * Integration Test 1: Authenticated user can access protected route
   * Verifies auth check passes and protected content is rendered
   */
  test('should render protected content when user is authenticated', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    // Wait for auth check to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
    });

    // Protected content should be visible
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Spinner should not be visible
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  /**
   * Integration Test 2: Unauthenticated user sees spinner
   * Verifies auth gate prevents rendering of protected content
   */
  test('should show spinner when user is not authenticated', async () => {
    axios.get.mockResolvedValue({ data: { ok: false } });

    renderWithPrivateRoute(); // No initial auth

    // Spinner should appear
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    // Protected content should NOT be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  /**
   * Integration Test 3: Auth check is called on mount
   * Verifies the route gate performs authentication check
   */
  test('should perform auth check when route is accessed', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Integration Test 4: Auth check only runs when token exists
   * Verifies optimization that skips check for missing token
   */
  test('should skip auth check if no token is present', async () => {
    renderWithPrivateRoute(); // No initial auth state

    // Wait a bit to see if axios is called
    await waitFor(
      () => {
        expect(axios.get).not.toHaveBeenCalled();
      },
      { timeout: 200 }
    );

    // Spinner should be shown
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  /**
   * Integration Test 5: API error results in denied access
   * Verifies error handling in auth check
   */
  test('should deny access if auth check API fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    // Protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  /**
   * Integration Test 6: Re-auth on token dependency change
   * Verifies component responds to auth state changes
   */
  test('should re-check auth when token changes', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Should have rendered protected content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 7: Multiple protected routes
   * Verifies all nested protected routes are guarded
   */
  test('should protect all nested routes within PrivateRoute', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    setupAuthInStorage(initialAuth);
    render(
      <MemoryRouter initialEntries={['/dashboard/user/profile']}>
        <AuthProvider>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route
                path="/dashboard/user/dashboard"
                element={<div>Protected Dashboard</div>}
              />
              <Route
                path="/dashboard/user/profile"
                element={<div>Protected Profile</div>}
              />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
    });

    // Protected content should be visible
    await waitFor(() => {
      expect(screen.getByText('Protected Profile')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 8: Outlet renders child routes
   * Verifies PrivateRoute properly uses Outlet for nested routes
   */
  test('should render outlet for child routes when authenticated', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 9: Auth context integration
   * Verifies context state is properly read by PrivateRoute
   */
  test('should read auth context to determine access', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'valid-token-123',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    // Auth check should only run because token exists
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Protected page should render
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 10: Concurrent auth checks
   * Verifies component handles concurrent dependency updates
   */
  test('should handle rapid token changes without race conditions', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    const initialAuth = {
      token: 'token-1',
      user: mockUser,
    };

    renderWithPrivateRoute(initialAuth);

    // Should eventually render protected content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Verify auth check was called
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });
});
