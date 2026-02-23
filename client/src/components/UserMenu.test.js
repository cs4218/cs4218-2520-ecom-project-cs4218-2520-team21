import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserMenu from './UserMenu';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  NavLink: ({ children, to, ...props }) => <a {...props} href={to}>{children}</a>,
}));

describe('UserMenu', () => {
  test('renders menu options', () => {
    // Arrange
    // Act
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>,
    );
    // Assert
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  test('renders Dashboard heading', () => {
    // Arrange
    // Act
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>,
    );
    // Assert
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('Profile link has correct path', () => {
    // Arrange
    // Act
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>,
    );
    const profileLink = screen.getByText('Profile').closest('a');
    // Assert
    expect(profileLink).toHaveAttribute('href', '/dashboard/user/profile');
  });

  test('Orders link has correct path', () => {
    // Arrange
    // Act
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>,
    );
    const ordersLink = screen.getByText('Orders').closest('a');
    // Assert
    expect(ordersLink).toHaveAttribute('href', '/dashboard/user/orders');
  });
});
