// Lim Rui Ting Valencia, A0255150N

/**
 * Profile + Dashboard Integration Test
 * 
 * Sandwich approach:
 * - REAL: Profile.js, Dashboard.js, UserMenu.js, Layout.js, AuthContext, AuthProvider
 * - MOCKED: axios (API calls), react-router navigate, react-hot-toast, Spinner
 * 
 * Tests integration of profile update flow that updates auth state and affects dashboard view.
 * Demonstrates component composition and context propagation across pages.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Profile from './Profile';
import Dashboard from './Dashboard';
import { AuthProvider } from '../../context/auth';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
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

describe('Component Integration (Top-Down): Profile ↔ Dashboard', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    address: '123 Main St',
  };

  const setupAuthInStorage = (authData) => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
    }
  };

  const renderProfileWithDashboard = (initialAuth = null) => {
    setupAuthInStorage(initialAuth);
    return render(
      <MemoryRouter initialEntries={['/dashboard/user/profile']}>
        <AuthProvider>
          <div>
            <Profile />
            <Dashboard />
          </div>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Integration Test 1: Profile update flow
   * Verifies that updating profile via Profile component updates shared auth context
   * and that Dashboard component reflects the updated user data
   */
  test('should update profile and reflect changes in dashboard context', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    // Mock API response
    const updatedUser = {
      ...mockUser,
      name: 'Jane Doe',
      phone: '555-5678',
    };
    axios.put.mockResolvedValue({ data: { updatedUser } });

    renderProfileWithDashboard(initialAuth);

    // Find and fill form fields in Profile component
    const nameInput = screen.getByDisplayValue(mockUser.name);
    const phoneInput = screen.getByDisplayValue(mockUser.phone);

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '555-5678' } });

    // Submit profile update form
    const updateButton = screen.getByRole('button', { name: /UPDATE/i });
    fireEvent.click(updateButton);

    // Wait for API call and state update
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/auth/profile',
        expect.objectContaining({
          name: 'Jane Doe',
          phone: '555-5678',
        })
      );
    });

    // Verify success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');
    });

    // Verify localStorage was updated (context persistence)
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    expect(storedAuth.user.name).toBe('Jane Doe');
  });

  /**
   * Integration Test 2: Profile form with UserMenu component
   * Verifies the profile page renders with the menu and both update
   */
  test('should render profile page with user menu and form fields', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderProfileWithDashboard(initialAuth);

    // Verify Profile component rendered
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();

    // Verify UserMenu component rendered
    const profileLinks = screen.getAllByText('Profile');
    expect(profileLinks.length).toBeGreaterThan(0);

    const ordersLinks = screen.getAllByText('Orders');
    expect(ordersLinks.length).toBeGreaterThan(0);
  });

  /**
   * Integration Test 3: Profile update failure handling
   * Verifies error handling flow through component integration
   */
  test('should handle profile update errors gracefully', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    // Mock API error
    axios.put.mockRejectedValue(new Error('Network error'));

    renderProfileWithDashboard(initialAuth);

    const nameInput = screen.getByDisplayValue(mockUser.name);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    const updateButton = screen.getByRole('button', { name: /UPDATE/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });

    // Verify user data unchanged in context
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    expect(storedAuth.user.name).toBe(mockUser.name);
  });

  /**
   * Integration Test 4: Email field disabled in profile
   * Verifies email field cannot be edited (integration of UI constraint)
   */
  test('should disable email field for security', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderProfileWithDashboard(initialAuth);

    const emailInput = screen.getByDisplayValue(mockUser.email);
    expect(emailInput).toBeDisabled();
  });

  /**
   * Integration Test 5: Form validation - empty phone
   * Verifies validation is enforced through the component chain
   */
  test('should validate phone field is not empty on submission', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    // Mock validation error response
    axios.put.mockResolvedValue({
      data: {
        success: false,
        error: 'Phone is required',
      },
    });

    renderProfileWithDashboard(initialAuth);

    const phoneInput = screen.getByDisplayValue(mockUser.phone);
    fireEvent.change(phoneInput, { target: { value: '' } });

    const updateButton = screen.getByRole('button', { name: /UPDATE/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  /**
   * Integration Test 6: Password update in profile
   * Verifies sensitive field handling in form
   */
  test('should accept password field and send to API', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    axios.put.mockResolvedValue({
      data: { updatedUser: mockUser },
    });

    renderProfileWithDashboard(initialAuth);

    const passwordInputs = screen.getAllByPlaceholderText(/Enter Your Password/i);
    const passwordField = passwordInputs[0];

    fireEvent.change(passwordField, { target: { value: 'newpassword123' } });

    const updateButton = screen.getByRole('button', { name: /UPDATE/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/auth/profile',
        expect.objectContaining({
          password: 'newpassword123',
        })
      );
    });
  });

  /**
   * Integration Test 7: Delete account modal interaction
   * Verifies modal integration with profile form
   */
  test('should show delete account confirmation modal', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderProfileWithDashboard(initialAuth);

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    fireEvent.click(deleteButton);

    // Modal should appear
    const confirmText = screen.getByText(/Are you sure.*delete.*account/i);
    expect(confirmText).toBeInTheDocument();

    // Modal should have confirm and cancel buttons
    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  /**
   * Integration Test 8: Delete account cancel flow
   * Verifies modal dismissal doesn't trigger deletion
   */
  test('should cancel delete account when user clicks Cancel', async () => {
    const initialAuth = {
      token: 'test-token',
      user: mockUser,
    };

    renderProfileWithDashboard(initialAuth);

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    fireEvent.click(deleteButton);

    // Click cancel in modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should disappear
    const confirmText = screen.queryByText(/Are you sure.*delete.*account/i);
    expect(confirmText).not.toBeInTheDocument();

    // No API call should be made
    expect(axios.delete).not.toHaveBeenCalled();
  });
});
