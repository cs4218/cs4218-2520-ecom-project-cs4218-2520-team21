// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './Dashboard';

jest.mock('../../context/auth', () => ({
  useAuth: () => [
    {
      user: { name: 'John Doe', email: 'john@doe.com', address: 'Somewhere' },
    },
    jest.fn(),
  ],
}));

describe('Dashboard page', () => {
  test('displays user information from auth context', () => {
    // Arrange: Render Dashboard component
    render(<Dashboard />);

    // Act: No action needed, just render

    // Assert: User information is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@doe.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Somewhere/i)).toBeInTheDocument();
  });
});

