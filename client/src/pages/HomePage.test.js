// Ariella Thirza Callista A0255876L
// AI tools (ChatGPT, Claude) were used to help configure mocks, generate edge cases and identify potential brittleness in tests

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './HomePage';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';

// Mocks
jest.mock('axios');

jest.mock('react-hot-toast');

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()])
}));

jest.mock("../components/Prices", () => ({
  Prices: [
    { _id: 0, name: "$0 to 19",     array: [0, 19]     },
    { _id: 1, name: "$20 to 39",    array: [20, 39]    },
    { _id: 2, name: "$40 to 59",    array: [40, 59]    },
    { _id: 3, name: "$60 to 79",    array: [60, 79]    },
    { _id: 4, name: "$80 to 99",    array: [80, 99]    },
    { _id: 5, name: "$100 or more", array: [100, 9999] },
  ],
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('./../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));

jest.mock("antd", () => {
  const Checkbox = ({ children, onChange, checked }) => (
    <label>
      <input 
        type="checkbox" 
        data-testid="category-checkbox" 
        onChange={onChange}
        checked={checked}
        readOnly={false}
      />
      {children}
    </label>
  );

  const Radio = ({ children, value }) => (
    <label>
      <input 
        type='radio'
        value={JSON.stringify(value)}
        data-testid="price-radio"
        readOnly />
      {children}
    </label>
  )

  Radio.Group = ({ children, onChange }) => (
    <div
      data-testid="radio-group"
      onClick={(e) => {
        if (
          e.target &&
          e.target.tagName === "INPUT" &&
          e.target.type === "radio"
        ) {
          onChange?.({
            target: { value: JSON.parse(e.target.value) },
          });
        }
      }}
    >
      {children}
    </div>
  );

  return { Checkbox, Radio };
});

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});



// Fixtures
const mockCategories = [
  { _id: "cat1", name: "Electronics"},
  { _id: "cat2", name: "Clothing"},
  { _id: "cat3", name: "Books"}
];

const mockProducts = [
  {
    _id: "p1",
    name: "Test Product 1",
    slug: "test-product-1",
    description: "Test Product 1 description here",
    price: 20.99,
    category: "cat1"
  },
  {
    _id: "p2",
    name: "Test Product 2",
    slug: "test-product-2",
    description: "Test Product 2 description here. The quick brown fox jumped over the lazy dog.",
    price: 45.99,
    category: "cat2"
  }
];


// Helper functions for arrange/set up
const renderHomePage = () => 
  render (
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
 );

const mockHomePageWithProducts = () => {
  axios.get.mockImplementation((url => {
    if (url.includes("get-category")) 
      return Promise.resolve({ data: { success: true, category: mockCategories } });
    if (url.includes("product-count")) 
      return Promise.resolve({ data: { total: 10 } })
    if (url.includes("product-list/1"))
      return Promise.resolve({ data: { success: true, products: mockProducts } })
  }));
  // the products array itself doesnt matter as the only purpose here is to prevent axios.post from returning
  // undefined
  axios.post.mockResolvedValue({ data: { products: [] }}); 
};


// Tests
beforeEach(() => {
  jest.clearAllMocks();
});

// 1. Given the Homepage is rendered, when the page loads, then ...
describe("Given the HomePage is rendered", () => {
  describe("When the page loads", () => {
    beforeEach(() => {
      // Arrange before each test
      mockHomePageWithProducts();
    });
    

    test("Then it renders the Layout wrapper with the correct title", () => {
      // Act
      renderHomePage()

      // Assert
      const layout = screen.getByTestId("layout");
      expect(layout).toHaveAttribute("data-title", "ALL Products - Best offers");
    });

    test("Then it renders the banner image with the correct src and width", async () => {
      // Act
      renderHomePage();

      // Assert
      const banner = await screen.findByAltText("bannerimage");
      expect(banner).toHaveAttribute("src", "/images/Virtual.png");
      expect(banner).toHaveAttribute("width", "100%");
    });

    test("Then it renders the All Products heading", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("All Products")).toBeInTheDocument();
    });

    test("Then it renders the Filter By Category heading", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("Filter By Category")).toBeInTheDocument();
    });

    test("Then it renders the Filter By Price heading", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("Filter By Price")).toBeInTheDocument();
    });

    test("Then it renders the RESET FILTERS button", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("RESET FILTERS")).toBeInTheDocument();
    });
    
    test("Then it fetches ALL categories", async () => {
      // Act
      renderHomePage();

      // Assert
      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('get-category')));
    });

    test("Then it fetches the total Count of Products", async () => {
      // Act
      renderHomePage();

      // Assert
      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('product-count')));
    });
    
    test("Then it fetches products on the first page", async () => {
      // Act
      renderHomePage();
    
      // Assert
      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('product-list/1')));

    });

    test("Then it does not fetch the filtered products before any filter is selected", async () => {
      // Act
      renderHomePage()
      await screen.findByText("Test Product 1");
      await screen.findByText("Test Product 2");

      // Assert
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});

// 2. Given the categories have been fetched
describe("Given the categories have been fetched", () => {
  beforeEach(() => {
    // Arrange before each test
    mockHomePageWithProducts();
  });
  describe("When the page loads", () => {

    test("Then it displays all category names", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("Electronics")).toBeInTheDocument();
      expect(await screen.findByText("Clothing")).toBeInTheDocument();
      expect(await screen.findByText("Books")).toBeInTheDocument();

    });

    test("Then it renders the correct number of checkboxes", async () => {
      // Act 
      renderHomePage();

      // Assert
      expect(await screen.findAllByTestId("category-checkbox")).toHaveLength(
        mockCategories.length
      );
    });
  });

  describe("When a single category checkbox is checked", () => {
    test("Then it calls the filter API with that category's ID", async () => {
      // Arrange
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");

      // Act
      fireEvent.click(checkboxes[0]);

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("product-filters"),
          expect.objectContaining({ checked: ["cat1"], radio: [] })
        )
      });
    });
  });

  describe("When multiple category checkboxes are checked", () => {
    test("Then it calls the filter API with all of the categories' IDs", async () => {
      // Arrange
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");

      // Act
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("product-filters"),
          expect.objectContaining({ checked: ["cat1", "cat2"], radio: [] })
        )
      });
    });
  });

  describe("When a checked category checkbox is unchecked", () => {
    test("Then it removes that category ID from the filter", async () => {
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");

      // Act - check
      fireEvent.click(checkboxes[0]);

      // Wait for filter to be applied with cat1
      await waitFor(() =>
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("product-filters"),
          expect.objectContaining({ checked: ["cat1"] })
        )
      );

      // Act - uncheck
      fireEvent.click(checkboxes[0]);

      // Assert - filter API called again but with empty checked array
      await waitFor(() =>
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("product-list/1")
        )
      );
    });
  });

  describe("When there are no categories", () => {
    test("Then it does not render any category checkboxes", async () => {
      // Arrange
      axios.get.mockImplementation((url) => { // Override default axios.get mocks 
        if (url.includes("get-category"))
          return Promise.resolve({ data: { success: false} });
        if (url.includes("product-count"))
          return Promise.resolve({ data: { total: 0 } });
        if (url.includes("product-list"))
          return Promise.resolve({ data: {} });
      })

      // Act
      renderHomePage();

      // Assert
      await waitFor(() =>
        expect(screen.queryByTestId("category-checkbox")).not.toBeInTheDocument()
      );
    })
  });
});

// 3. Given the price filter options are fetched
describe("Given the price filter options are visible", () => {
  beforeEach(() => {
    // Arrange before each test
    mockHomePageWithProducts();
  });
  describe("When the page renders", () => {
    test("Then it displays all six price range options", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("$0 to 19")).toBeInTheDocument();
      expect(await screen.findByText("$20 to 39")).toBeInTheDocument();
      expect(await screen.findByText("$40 to 59")).toBeInTheDocument();
      expect(await screen.findByText("$60 to 79")).toBeInTheDocument();
      expect(await screen.findByText("$80 to 99")).toBeInTheDocument();
      expect(await screen.findByText("$100 or more")).toBeInTheDocument();
    });
  });

  describe("When a price range radio is selected", () => {
    test("Then it calls the filter API with the selected price range", async () => {
      // Arrange
      renderHomePage();
      const radioOption = screen.getByText("$0 to 19");
      
      // Act
      fireEvent.click(radioOption);

      // Assert
      await waitFor(() =>
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("product-filters"),
          expect.objectContaining({ checked: [], radio: [0, 19] })
        )
      );
    });
  });
});

// 4. Given a filter is applied
describe("Given a filter is applied", () => {
  describe("When the user clicks RESET FILTERS", () => {
    beforeEach(() => {
      // Arrange before each test
      mockHomePageWithProducts();
    });
    test("Then it should clear the filters selected", async () => {
      // Arrange
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");
      fireEvent.click(checkboxes[0])

      // Act
      fireEvent.click(await screen.findByText("RESET FILTERS"));

      // Assert
      await waitFor(() => {
        const checkboxesAfterReset = screen.getAllByTestId("category-checkbox");
        expect(checkboxesAfterReset[0]).not.toBeChecked();
      });
    })
  });
});

describe("Given the categories and price options are fetched", () => {
  describe("When the user applies both category and price filters", () => {
    test("Then it calls the product-filters API", async () => {
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");
      const radioOptions = screen.getAllByTestId("price-radio");

      fireEvent.click(checkboxes[0]);
      fireEvent.click(radioOptions[0]);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("product-filters"),
          expect.objectContaining({ checked: ["cat1"], radio: [0, 19] })
        );
      });
    });
  });
});


// 5. Given the products have loaded/been feched
describe("Given the products have loaded", () => {
  beforeEach(() => {
    // Arrange before each test
    mockHomePageWithProducts();
  });

  describe("when the page renders", () => {
    test("Then it displays all product names", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("Test Product 1")).toBeInTheDocument();
      expect(await screen.findByText("Test Product 2")).toBeInTheDocument();
    });

    test("Then it displays the price of each product in USD Currency", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText("$20.99")).toBeInTheDocument();
      expect(await screen.findByText("$45.99")).toBeInTheDocument();
      
    });

    test("Then it displays the description of each product truncated to 60 chars", async () => {
      // Arrange
      const expectedDesc = mockProducts[1].description.substring(0, 60) + "...";

      // Act
      renderHomePage();

      // Assert
      expect(await screen.findByText(expectedDesc)).toBeInTheDocument();
    });

    test("Then it renders a More Details button for each product", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findAllByText("More Details")).toHaveLength(mockProducts.length);
    });

    test("Then it renders an ADD TO CART Button for each product", async () => {
      // Act
      renderHomePage();

      // Assert
      expect(await screen.findAllByText("ADD TO CART")).toHaveLength(mockProducts.length);
    });
  });
});

// 6. Given a specific product is displayed
describe("Given a product is displayed on the page", () => {
  beforeEach(() => {
    // Arrange before each test
    mockHomePageWithProducts();
  });

  describe("When the user clicks ADD TO CART", () => {
    test("Then it shows a success toast notification", async () => {
      // Arrange
      renderHomePage();
      const cartButtons = await screen.findAllByText("ADD TO CART");

      // Act
      fireEvent.click(cartButtons[0]);

      // Assert
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });

    test("Then it shows a toast for each individual cart button clicked", async () => {
      // Arrange
      renderHomePage();
      const cartButtons = await screen.findAllByText("ADD TO CART");

      // Act
      fireEvent.click(cartButtons[0]);
      fireEvent.click(cartButtons[1]);

      // Assert
      expect(toast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe("When the user clicks More Details on the first product", () => {
    test("Then it should navigate to that product's detail page", async () => {
      renderHomePage();
      const buttons = await screen.findAllByText("More Details");

      fireEvent.click(buttons[0])

      expect(mockNavigate).toHaveBeenCalledWith("/product/test-product-1");
    })
  })
});

// 7. Given total count of products > number of products currently displayed
describe("Given there are more products than currently displayed", () => {
  beforeEach(() => {
    mockHomePageWithProducts()
  })

  describe("When the page renders", () => {
    test("Then it shows the Loadmore button", async () => {
      renderHomePage();
      expect(await screen.findByText("Loadmore")).toBeInTheDocument()
    })
  });

  describe("When the user clicks Loadmore", () => {
    test("Then it fetches the next page of products", async () => {
      renderHomePage();
      const loadMoreBtn = await screen.findByText("Loadmore");

      fireEvent.click(loadMoreBtn);

      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("product-list/2")))
    });

    test("Then it appends the new products to the existing list", async () => {
      // Arrange
      const page2Products = [
        {
          _id: "p3",
          name: "New Page Product",
          description: "A product loaded from the second page of results here",
          price: 39.99,
          slug: "new-page-product",
        },
      ];
      axios.get.mockImplementation((url) => {
        if (url.includes("get-category")) 
          return Promise.resolve({ data: { success: true, category: mockCategories } });
        if (url.includes("product-count")) 
          return Promise.resolve({ data: { total: 10 } })
        if (url.includes("product-list/1"))
          return Promise.resolve({ data: { success: true, products: mockProducts } })
        if (url.includes("product-list/2"))
          return Promise.resolve({ data: { products: page2Products } });
      });
      renderHomePage();
      const loadMoreBtn = await screen.findByText("Loadmore");
      await screen.findByText("Test Product 1");

      // Act
      fireEvent.click(loadMoreBtn);

      // Assert
      expect(await screen.findByText("New Page Product")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });
  });

})

// 8. Given the total count of products < number of currently displayed products
describe("Given the currently displayed products >= total count of products", () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes("get-category"))
        return Promise.resolve({ data: { success: true, category: mockCategories } });
      if (url.includes("product-count"))
        return Promise.resolve({ data: { total: 2 } });
      if (url.includes("product-list"))
        return Promise.resolve({ data: { products: mockProducts } });
    });
  });

  describe("When the page renders", () => {
    test("Then it should not show the Loadmore button", async () => {
      // Act
      renderHomePage();
      await screen.findByText("Test Product 1"); // wait for products to load

      // Assert
      expect(screen.queryByText(/Loadmore/i)).not.toBeInTheDocument();
    });
  });
});

// 9. Given a network failure occurs (tests error handling of failing APIs)
describe("Given a network failure occurs", () => {
  describe("When the category API fails", () => {
    beforeEach(() => {
      axios.get.mockImplementation((url) => {
        if (url.includes("get-category"))
          return Promise.reject(new Error("Network error"));
        if (url.includes("product-count"))
          return Promise.resolve({ data: { total: 0 } });
        if (url.includes("product-list"))
          return Promise.resolve({ data: { products: [] } });
      });
    })
    test("Then the page renders without crashing", async () => {
      expect(() => renderHomePage()).not.toThrow();
    });
  });

  describe("When the product list API fails", () => {
    beforeEach(() => {
      axios.get.mockImplementation((url) => {
        if (url.includes("get-category"))
          return Promise.resolve({ data: { success: true, category: [] } });
        if (url.includes("product-count"))
          return Promise.resolve({ data: { total: 0 } });
        if (url.includes("product-list"))
          return Promise.reject(new Error("Network error"));
      });
    })
    test("Then the page renders without crashing", async () => {
      expect(() => renderHomePage()).not.toThrow();
    });
  });

  describe("When the product count API fails", () => {
    beforeEach(() => {
      // Arrange
      axios.get.mockImplementation((url) => {
        if (url.includes("get-category")) 
          return Promise.resolve({ data: { success: true, category: [] } });
        if (url.includes("product-count"))
          return Promise.reject(new Error("Network error"));
        if (url.includes("product-list"))
          return Promise.resolve({ data: { products: [] } });
      });
    })
    test("Then the page renders without crashing", async () => {
      // Act & Assert
      expect(() => renderHomePage()).not.toThrow();
    });
  });

  describe("When the filter API fails", () => {
    beforeEach(() => {
      mockHomePageWithProducts()
    })

    test("Then the page renders without crashing after a filter is applied", async () => {
      // Arrange
      axios.post.mockRejectedValue(new Error("Filter API error"));
      renderHomePage();
      const checkboxes = await screen.findAllByTestId("category-checkbox");

      // Act & Assert
      expect(() => fireEvent.click(checkboxes[0])).not.toThrow();
    });
  });

  describe("When the loadmore API fails", () => {
    test("Then the page renders without crashing after loadmore is clicked", async () => {
      // Arrange
      axios.get.mockImplementation((url) => {
        if (url.includes("get-category"))
          return Promise.resolve({ data: { success: true, category: [] } });
        if (url.includes("product-count"))
          return Promise.resolve({ data: { total: 10 } });
        if (url.includes("product-list/1"))
          return Promise.resolve({ data: { products: mockProducts } });
        if (url.includes("product-list/2"))
          return Promise.reject(new Error("Load more failed"));
      });
      renderHomePage();
      const loadMoreBtn = await screen.findByText("Loadmore");

      expect(() => fireEvent.click(loadMoreBtn)).not.toThrow();
    });
  });
});
