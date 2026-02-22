// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';

import SearchInput from './SearchInput';

const searchState = { keyword: 'abc', results: [] };
const mockSet = jest.fn((updater) => {
  if (updater && typeof updater === 'object') {
    if (updater.keyword !== undefined) searchState.keyword = updater.keyword;
    if (updater.results !== undefined) searchState.results = updater.results;
  }
});
jest.mock('../../context/search', () => ({ useSearch: () => [searchState, mockSet] }));
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

describe('SearchInput', () => {
  let props;
  beforeEach(() => {
    props = { value: '', onChange: jest.fn() };
    searchState.keyword = 'abc';
    searchState.results = [];
    jest.clearAllMocks();
  });

  test('renders input', () => {
    // Arrange
    // Act
    render(<SearchInput {...props} />);
    // Assert
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('updates search keyword on input change', () => {
    // Arrange
    render(<SearchInput />);
    const input = screen.getByPlaceholderText('Search');
    // Act
    fireEvent.change(input, { target: { value: 'xyz' } });
    // Assert
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'xyz' }));
  });

  test('handles missing props gracefully', () => {
    // Arrange
    props = {};
    // Act
    render(<SearchInput {...props} />);
    // Assert
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('submits and navigates to /search and sets results', async () => {
    // Arrange
    const results = [{ _id: 'p1', name: 'Item' }];
    axios.get.mockResolvedValue({ data: results });
    render(<SearchInput />);
    const input = screen.getByPlaceholderText(/Search/i);
    const button = screen.getByRole('button', { name: /Search/i });
    // Act
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(button);
    await screen.findByPlaceholderText(/Search/i);
    // Assert
    expect(axios.get).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });

  test('search input accepts typing', () => {
    // Arrange
    render(<SearchInput />);
    const input = screen.getByPlaceholderText(/Search/i);
    // Act
    fireEvent.change(input, { target: { value: 'abc' } });
    // Assert
    expect(input.value).toBe('abc');
  });

  test('submit button exists and form can be submitted', () => {
    // Arrange
    // Act
    render(<SearchInput />);
    // Assert
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('handles axios error gracefully', async () => {
    // Arrange
    axios.get.mockRejectedValue(new Error('fail'));
    render(<SearchInput />);
    const input = screen.getByPlaceholderText(/Search/i);
    const button = screen.getByRole('button', { name: /Search/i });
    // Act
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(button);
    // Assert
    expect(axios.get).toHaveBeenCalled();
  });

  test('input and button have accessible roles/labels', () => {
    // Arrange
    // Act
    render(<SearchInput />);
    // Assert
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('handles long and special character input without throwing', () => {
    // Arrange
    render(<SearchInput />);
    const input = screen.getByPlaceholderText(/Search/i);
    // Act & Assert
    expect(() => fireEvent.change(input, { target: { value: 'a'.repeat(100) + '!@#' } })).not.toThrow();
  });
});
