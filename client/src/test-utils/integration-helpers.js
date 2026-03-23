/**
 * Frontend Integration Test Helpers
 * Sandwich approach: Real component composition + context providers, minimal boundary mocks
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/auth';
import { SearchProvider } from '../context/search';

/**
 * Render component with real Auth and Search context providers, optional routing
 * @param {React.ReactNode} component - The component to render
 * @param {Object} options - Configuration options
 * @param {string} options.initialRoute - Initial route for MemoryRouter
 * @param {Object} options.initialAuthState - Pre-populate auth context state
 * @param {Object} options.initialSearchState - Pre-populate search context state
 * @param {boolean} options.withRouter - Include MemoryRouter (default true)
 * @param {boolean} options.withAuth - Include AuthProvider (default true)
 * @param {boolean} options.withSearch - Include SearchProvider (default false)
 * @returns {Object} RTL render result
 */
export function renderWithProviders(component, options = {}) {
  const {
    initialRoute = '/',
    initialAuthState = null,
    initialSearchState = null,
    withRouter = true,
    withAuth = true,
    withSearch = false,
  } = options;

  let Wrapper = ({ children }) => <>{children}</>;

  if (withRouter) {
    const Router = ({ children }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    );
    Wrapper = Router;
  }

  if (withAuth) {
    const AuthWrapper = Wrapper;
    Wrapper = ({ children }) => (
      <AuthWrapper>
        <AuthProvider initialState={initialAuthState}>
          {children}
        </AuthProvider>
      </AuthWrapper>
    );
  }

  if (withSearch) {
    const SearchWrapper = Wrapper;
    Wrapper = ({ children }) => (
      <SearchWrapper>
        <SearchProvider initialState={initialSearchState}>
          {children}
        </SearchProvider>
      </SearchWrapper>
    );
  }

  return render(component, { wrapper: Wrapper });
}

/**
 * Create mock auth state for testing authenticated components
 * @param {Object} overrides - Override default values
 * @returns {Object} Auth state object
 */
export function createMockAuthState(overrides = {}) {
  return {
    token: 'test-token-xyz',
    user: {
      _id: 'test-user-123',
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '555-1234',
      address: '123 Test St',
      role: 0,
      ...overrides.user,
    },
    ...overrides,
  };
}

/**
 * Create mock admin auth state
 * @param {Object} overrides - Override default values
 * @returns {Object} Auth state object with admin role
 */
export function createMockAdminState(overrides = {}) {
  return createMockAuthState({
    user: {
      _id: 'test-admin-123',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '555-5678',
      address: '456 Admin Ave',
      role: 1,
      ...overrides.user,
    },
    ...overrides,
  });
}

/**
 * Wait for async operations in tests (for loading states, data fetches)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export function waitFor(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
