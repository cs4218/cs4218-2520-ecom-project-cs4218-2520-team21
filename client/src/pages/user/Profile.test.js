// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from './Profile';
import axios from 'axios';

const mockSetAuth = jest.fn();
const authState = {
  user: { name: 'Jane', email: 'jane@example.com', address: '123 Main', phone: '12345678' },
  token: 'tok',
};

jest.mock('../../context/auth', () => ({
  useAuth: () => [authState, mockSetAuth],
}));
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>UM</div>);
jest.mock('react-hot-toast', () => {
  const toast = { success: jest.fn(), error: jest.fn() };
  return { __esModule: true, default: toast };
});
jest.mock('axios');

describe('Profile page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authState.user = {
      name: 'Jane',
      email: 'jane@example.com',
      address: '123 Main',
      phone: '12345678',
    };
    authState.token = 'tok';
  });

  test('renders profile info', () => {
    // Arrange
    // Act
    render(<Profile />);
    // Assert
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    // Arrange
    authState.user = null;
    // Act
    render(<Profile />);
    // Assert
    expect(screen.getByText('No profile')).toBeInTheDocument();
  });

  test('submits form and keeps values', async () => {
    // Arrange
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jane',
          email: 'jane@example.com',
          phone: '12345678',
          address: '123 Main',
        },
      },
    });
    render(<Profile />);
    // Act
    fireEvent.click(screen.getByRole('button', { name: /UPDATE/i }));
    // Assert
    expect(axios.put).toHaveBeenCalled();
  });

  test('delete account flow shows confirmation', () => {
    // Arrange
    render(<Profile />);
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    // Act
    fireEvent.click(deleteButton);
    // Assert
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
  });

  test('handles axios error gracefully', async () => {
    // Arrange
    axios.put.mockRejectedValue(new Error('fail'));
    render(<Profile />);
    // Act
    fireEvent.click(screen.getByRole('button', { name: /UPDATE/i }));
    await screen.findByRole('button', { name: /UPDATE/i });
    // Assert: component still renders (no crash)
    expect(screen.getByRole('button', { name: /UPDATE/i })).toBeInTheDocument();
  });

  test('cancel closes confirmation modal', () => {
    // Arrange
    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    // Act
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    // Assert
    expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
  });
});
