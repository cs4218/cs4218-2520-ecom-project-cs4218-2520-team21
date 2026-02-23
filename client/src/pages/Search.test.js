// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Search from './Search';

const mockSetValues = jest.fn();
const mockSearchState = { keyword: '', results: [] };
jest.mock('../context/search', () => ({
  useSearch: () => [mockSearchState, mockSetValues],
}));
jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

describe('Search page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockSearchState.keyword = '';
    mockSearchState.results = [];
  });

  test('renders search results', () => {
    // Arrange
    mockSearchState.results = [
      { _id: '1', name: 'Product A', description: 'Desc A', price: 10 },
      { _id: '2', name: 'Product B', description: 'Desc B', price: 20 },
    ];
    // Act
    render(<Search />);
    // Assert
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    // Arrange
    mockSearchState.results = [];
    // Act
    render(<Search />);
    // Assert
    expect(screen.getByText('No Products Found')).toBeInTheDocument();
  });

  test('renders single result', () => {
    // Arrange
    mockSearchState.results = [{ _id: '1', name: 'Single Item', description: 'Desc', price: 5 }];
    // Act
    render(<Search />);
    // Assert
    expect(screen.getByText('Single Item')).toBeInTheDocument();
  });
});
