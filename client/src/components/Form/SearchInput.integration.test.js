// Lim Rui Ting Valencia, A0255150N

/**
 * SearchInput + Search Integration Test
 * 
 * Sandwich approach:
 * - REAL: SearchInput.js, Search.js, SearchContext, MemoryRouter navigation
 * - MOCKED: axios (search API), useNavigate side effects
 * 
 * Tests integration of search input submission through context to results page.
 * Demonstrates real context provider integration and component data flow.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider } from '../../context/search';
import SearchInput from '../../components/Form/SearchInput';
import Search from '../../pages/Search';

jest.mock('axios');

// Mock Layout component to simplify test
jest.mock('../../components/Layout', () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

describe('Component Integration: SearchInput ↔ Search via Context', () => {
  const mockProducts = [
    {
      _id: 'prod-1',
      name: 'Test Laptop',
      description: 'High performance laptop',
      price: 999.99,
    },
    {
      _id: 'prod-2',
      name: 'Test Mouse',
      description: 'Wireless mouse with ergonomic design',
      price: 29.99,
    },
  ];

  const renderSearchFlow = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <SearchProvider>
          <Routes>
            <Route path="/" element={<SearchInput />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </SearchProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Integration Test 1: Complete search flow
   * Verifies search input submission updates context and navigates to results page
   */
  test('should perform search and display results on separate page', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    // Find and fill search input
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    // Submit search
    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    // Verify API call was made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/laptop');
    });

    // Verify navigation occurred (Routes should render Search component)
    await waitFor(() => {
      expect(screen.getByText('Search Resuts')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 2: Search results display product cards
   * Verifies API response is rendered through context
   */
  test('should display product cards from search results', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    // Wait for products to appear
    await waitFor(() => {
      expect(screen.getByText('Test Laptop')).toBeInTheDocument();
      expect(screen.getByText('Test Mouse')).toBeInTheDocument();
    });

    // Verify product details are displayed
    expect(screen.getByText(/High performance laptop/)).toBeInTheDocument();
    expect(screen.getByText(/Wireless mouse/)).toBeInTheDocument();
  });

  /**
   * Integration Test 3: Search result count display
   * Verifies context stores and displays result count
   */
  test('should display number of search results found', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Found 2/)).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 4: Empty search results
   * Verifies proper message when no results found
   */
  test('should show "No Products Found" when search returns empty results', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 5: Product price display
   * Verifies prices from API are shown on result cards
   */
  test('should display product prices in search results', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'product' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('$ 999.99')).toBeInTheDocument();
      expect(screen.getByText('$ 29.99')).toBeInTheDocument();
    });
  });

  /**
   * Integration Test 6: Search input maintains keyword in context
   * Verifies search term is stored in SearchContext
   */
  test('should maintain search keyword in context', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    const keyword = 'electronics';
    fireEvent.change(searchInput, { target: { value: keyword } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `/api/v1/product/search/${keyword}`
      );
    });
  });

  /**
   * Integration Test 7: API error handling
   * Verifies component handles fetch errors gracefully
   */
  test('should handle API errors without crashing', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    // Search form should still be available after API error
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/test');
    });

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.queryByText('Search Resuts')).not.toBeInTheDocument();
  });

  /**
   * Integration Test 8: Search input cleared state
   * Verifies input field value can be cleared
   */
  test('should clear search input value when needed', async () => {
    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput.value).toBe('test query');

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(searchInput.value).toBe('');
  });

  /**
   * Integration Test 9: Multiple searches in sequence
   * Verifies context updates correctly for multiple searches
   */
  test('should handle multiple searches in sequence', async () => {
    const firstResults = [mockProducts[0]];
    const secondResults = [mockProducts[1]];

    axios.get
      .mockResolvedValueOnce({ data: firstResults })
      .mockResolvedValueOnce({ data: secondResults });

    const firstRender = renderSearchFlow();

    // First search
    let searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    let searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Laptop')).toBeInTheDocument();
    });

    // Re-render search flow for a second search sequence
    firstRender.unmount();
    renderSearchFlow();

    // Second search
    searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'mouse' } });

    searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/mouse');
    });
  });

  /**
   * Integration Test 10: Product card action buttons
   * Verifies all interactive elements are present
   */
  test('should display action buttons on product cards', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'product' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      const detailsButtons = screen.getAllByRole('button', {
        name: /More Details/i,
      });
      const cartButtons = screen.getAllByRole('button', {
        name: /ADD TO CART/i,
      });

      expect(detailsButtons.length).toBe(2);
      expect(cartButtons.length).toBe(2);
    });
  });

  /**
   * Integration Test 11: Search page layout
   * Verifies search results page has proper structure
   */
  test('should render search page with header and result count', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });

    renderSearchFlow();

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'product' } });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Search Resuts')).toBeInTheDocument();
      expect(screen.getByText(/Found 2/)).toBeInTheDocument();
    });
  });
});
