import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Users from './Users';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../components/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/AdminMenu', () => () => <div>ADM</div>);

describe('Users page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders user info', async () => {
    // Arrange: role 1 = Admin in Users.js
    const mockUsers = [
      {
        _id: '1',
        name: 'Jane',
        email: 'jane@example.com',
        address: '123 Main',
        phone: '12345678',
        role: 1,
      },
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    // Act
    render(<Users />);
    // Assert
    expect(await screen.findByText('Jane')).toBeInTheDocument();
    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(await screen.findByText('123 Main')).toBeInTheDocument();
    expect(await screen.findByText('12345678')).toBeInTheDocument();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  test('renders empty state', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: [] });
    // Act
    render(<Users />);
    // Assert
    expect(await screen.findByText('No users')).toBeInTheDocument();
  });

  test('displays User role when role is 0', async () => {
    // Arrange
    const mockUsers = [
      {
        _id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        address: '456 Oak',
        phone: '87654321',
        role: 0,
      },
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    // Act
    render(<Users />);
    // Assert
    expect(await screen.findByText('User')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
  });
});
