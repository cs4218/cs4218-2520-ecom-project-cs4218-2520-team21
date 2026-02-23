import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AdminDashboard from './AdminDashboard';

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>ADM</div>);
jest.mock('../../context/auth', () => ({
  useAuth: () => [{ user: { name: 'Admin User', email: 'admin@example.com', phone: '12345678' } }],
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders admin info', () => {
    // Arrange
    // Act
    render(<AdminDashboard />);
    // Assert
    expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/12345678/i)).toBeInTheDocument();
  });

  test('renders AdminMenu', () => {
    // Arrange
    // Act
    render(<AdminDashboard />);
    // Assert
    expect(screen.getByText('ADM')).toBeInTheDocument();
  });
});
