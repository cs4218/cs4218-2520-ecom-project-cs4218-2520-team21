import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";
import { Helmet } from "react-helmet";

jest.mock("./Header", () => {
  return function Header() {
    return <div>Header</div>;
  };
});

jest.mock("./Footer", () => {
  return function Footer() {
    return <div>Footer</div>;
  };
});

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div>Toaster</div>,
}));

describe("Layout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children content", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("renders Header component", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(getByText("Header")).toBeInTheDocument();
  });

  it("renders Footer component", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(getByText("Footer")).toBeInTheDocument();
  });

  it("renders Toaster component", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(getByText("Toaster")).toBeInTheDocument();
  });

  it("uses default title when no title prop is provided", () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    expect(helmet.title).toBe("Ecommerce app - shop now");
  });

  it("uses custom title when title prop is provided", () => {
    render(
      <MemoryRouter>
        <Layout title="Custom Title">
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    expect(helmet.title).toBe("Custom Title");
  });

  it("sets default meta description", () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const descriptionMeta = helmet.metaTags.find(
      (tag) => tag.name === "description",
    );
    expect(descriptionMeta.content).toBe("mern stack project");
  });

  it("sets custom meta description when provided", () => {
    render(
      <MemoryRouter>
        <Layout description="Custom Description">
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const descriptionMeta = helmet.metaTags.find(
      (tag) => tag.name === "description",
    );
    expect(descriptionMeta.content).toBe("Custom Description");
  });

  it("sets default meta keywords", () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const keywordsMeta = helmet.metaTags.find((tag) => tag.name === "keywords");
    expect(keywordsMeta.content).toBe("mern,react,node,mongodb");
  });

  it("sets custom meta keywords when provided", () => {
    render(
      <MemoryRouter>
        <Layout keywords="custom,keywords,test">
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const keywordsMeta = helmet.metaTags.find((tag) => tag.name === "keywords");
    expect(keywordsMeta.content).toBe("custom,keywords,test");
  });

  it("sets default meta author", () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const authorMeta = helmet.metaTags.find((tag) => tag.name === "author");
    expect(authorMeta.content).toBe("Techinfoyt");
  });

  it("sets custom meta author when provided", () => {
    render(
      <MemoryRouter>
        <Layout author="Custom Author">
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const authorMeta = helmet.metaTags.find((tag) => tag.name === "author");
    expect(authorMeta.content).toBe("Custom Author");
  });

  it("sets charset to utf-8", () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const helmet = Helmet.peek();
    const charsetMeta = helmet.metaTags.find((tag) => tag.charset);
    expect(charsetMeta.charset).toBe("utf-8");
  });

  it("renders main content with minimum height style", () => {
    const { container } = render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const main = container.querySelector("main");
    expect(main).toHaveStyle({ minHeight: "70vh" });
  });

  it("renders all components together with custom props", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Layout
          title="Test Title"
          description="Test Description"
          keywords="test,keywords"
          author="Test Author"
        >
          <div>Custom Children Content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(getByText("Header")).toBeInTheDocument();
    expect(getByText("Custom Children Content")).toBeInTheDocument();
    expect(getByText("Footer")).toBeInTheDocument();
    expect(getByText("Toaster")).toBeInTheDocument();

    const helmet = Helmet.peek();
    expect(helmet.title).toBe("Test Title");
  });
});
