// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './Dashboard';
import * as authContext from '../../context/auth';

jest.mock('../../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));
jest.mock('../../components/UserMenu', () => () => <div data-testid="user-menu">UserMenu</div>);

describe('Dashboard (user)', () => {
  beforeEach(() => {
    jest.spyOn(authContext, 'useAuth').mockReturnValue([
      {
        user: { name: 'John Doe', email: 'john@doe.com', address: 'Somewhere' },
      },
      jest.fn(),
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays user name, email, and address from auth context', () => {
    // Arrange & Act
    render(<Dashboard />);
    // Assert
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@doe\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Somewhere/i)).toBeInTheDocument();
  });

  test('renders Layout with correct title', () => {
    // Arrange & Act
    render(<Dashboard />);
    // Assert
    const layout = screen.getByTestId('layout');
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute('data-title', 'Dashboard - Ecommerce App');
  });

  test('renders UserMenu', () => {
    // Arrange & Act
    render(<Dashboard />);
    // Assert
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('UserMenu')).toBeInTheDocument();
  });

  test('renders safely when auth is null', () => {
    // Arrange
    jest.spyOn(authContext, 'useAuth').mockReturnValue([null, jest.fn()]);
    // Act
    render(<Dashboard />);
    // Assert: no crash; Layout and UserMenu still present; user fields not shown
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  });

  test('renders safely when auth.user is null', () => {
    // Arrange
    jest.spyOn(authContext, 'useAuth').mockReturnValue([{ user: null }, jest.fn()]);
    // Act
    render(<Dashboard />);
    // Assert: no crash; structure still present
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.queryByText(/john@doe\.com/i)).not.toBeInTheDocument();
  });

  test('renders partial user data without crashing', () => {
    // Arrange: only name present, email and address undefined
    jest.spyOn(authContext, 'useAuth').mockReturnValue([
      { user: { name: 'Jane Only' } },
      jest.fn(),
    ]);
    // Act
    render(<Dashboard />);
    // Assert
    expect(screen.getByText(/Jane Only/i)).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  test('renders empty auth.user object without crashing', () => {
    // Arrange
    jest.spyOn(authContext, 'useAuth').mockReturnValue([{ user: {} }, jest.fn()]);
    // Act
    render(<Dashboard />);
    // Assert: no crash; Layout and UserMenu present
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});
