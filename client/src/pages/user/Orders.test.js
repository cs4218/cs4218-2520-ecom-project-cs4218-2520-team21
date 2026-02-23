// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Orders from './Orders';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: () => [{ token: 'token' }, jest.fn()],
}));
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>UM</div>);
jest.mock('moment', () => () => ({ fromNow: () => '2 days ago' }));

describe('Orders page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders order info', async () => {
    // Arrange
    const mockOrders = [
      {
        status: 'Pending',
        buyer: { name: 'Jane' },
        createAt: new Date(),
        payment: { success: true },
        products: [],
      },
    ];
    axios.get.mockResolvedValue({ data: mockOrders });
    // Act
    render(<Orders />);
    // Assert
    expect(await screen.findByText('Pending')).toBeInTheDocument();
    expect(await screen.findByText('Jane')).toBeInTheDocument();
  });

  test('renders empty state', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: [] });
    // Act
    render(<Orders />);
    // Assert
    expect(await screen.findByText('No orders')).toBeInTheDocument();
  });

  test('handles axios error gracefully', async () => {
    // Arrange
    axios.get.mockRejectedValue(new Error('fail'));
    // Act
    render(<Orders />);
    // Assert
    expect(await screen.findByText(/All Orders/i)).toBeInTheDocument();
  });

  test('renders page header', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: [] });
    // Act
    render(<Orders />);
    // Assert
    expect(await screen.findByText('All Orders')).toBeInTheDocument();
  });
});
