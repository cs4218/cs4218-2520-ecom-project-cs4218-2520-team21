// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PrivateRoute from './Private';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: () => [{ token: 'token' }, jest.fn()],
}));
jest.mock('../Spinner', () => () => <div>Spinner</div>);
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div>OUTLET</div>,
}));

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders Outlet when auth check returns ok', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: { ok: true } });
    // Act
    render(<PrivateRoute />);
    // Assert
    expect(await screen.findByText('OUTLET')).toBeInTheDocument();
  });

  test('renders Spinner when auth check returns not ok', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: { ok: false } });
    // Act
    render(<PrivateRoute />);
    // Assert
    expect(await screen.findByText('Spinner')).toBeInTheDocument();
  });

  test('handles axios error gracefully', async () => {
    // Arrange
    axios.get.mockRejectedValue(new Error('fail'));
    // Act
    render(<PrivateRoute />);
    // Assert
    expect(await screen.findByText('Spinner')).toBeInTheDocument();
  });
});
