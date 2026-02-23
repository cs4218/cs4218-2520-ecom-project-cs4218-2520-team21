// Lim Rui Ting Valencia, A0255150N
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchProvider, useSearch } from './search';

const Consumer = () => {
  const [values] = useSearch();
  return (
    <div>
      <span>KW:{values.keyword}</span>
      <span>LEN:{values.results.length}</span>
    </div>
  );
};

const ConsumerWithSetter = () => {
  const [values, setValues] = useSearch();
  return (
    <div>
      <span>KW:{values.keyword}</span>
      <span>LEN:{values.results.length}</span>
      <button type="button" onClick={() => setValues({ keyword: 'updated', results: [1, 2] })}>
        Update
      </button>
    </div>
  );
};

describe('search context', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('provides default values', () => {
    // Arrange
    // Act
    render(
      <SearchProvider>
        <Consumer />
      </SearchProvider>,
    );
    // Assert
    expect(screen.getByText(/KW:/i)).toHaveTextContent('KW:');
    expect(screen.getByText(/LEN:/i)).toHaveTextContent('LEN:0');
  });

  test('updating state via setter reflects in consumer', () => {
    // Arrange
    render(
      <SearchProvider>
        <ConsumerWithSetter />
      </SearchProvider>,
    );
    expect(screen.getByText(/LEN:0/)).toBeInTheDocument();
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    // Assert
    expect(screen.getByText(/KW:updated/)).toBeInTheDocument();
    expect(screen.getByText(/LEN:2/)).toBeInTheDocument();
  });

  test('handles empty results', () => {
    // Arrange
    // Act
    render(
      <SearchProvider>
        <Consumer />
      </SearchProvider>,
    );
    // Assert
    expect(screen.getByText(/LEN:0/)).toBeInTheDocument();
  });

  test('provider renders children', () => {
    // Arrange
    // Act
    render(
      <SearchProvider>
        <div data-testid="child">Child</div>
      </SearchProvider>,
    );
    // Assert
    expect(screen.getByTestId('child')).toHaveTextContent('Child');
  });
});
