import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Spinner from "./Spinner";

const mockNavigate = jest.fn();
const mockLocation = { pathname: "/dashboard" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe("Spinner Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {});

  it("renders spinner with initial count of 3", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    expect(getByText("redirecting to you in 3 second")).toBeInTheDocument();
  });

  it("renders loading spinner element", () => {
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    expect(getByRole("status")).toBeInTheDocument();
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  it("updates countdown every second correctly", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    expect(getByText("redirecting to you in 3 second")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText("redirecting to you in 2 second")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText("redirecting to you in 1 second")).toBeInTheDocument();
  });

  it("navigates to default login path when count reaches 0", async () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/dashboard",
      });
    });
  });

  it("navigates to custom path when path prop is provided", async () => {
    render(
      <MemoryRouter>
        <Spinner path="register" />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register", {
        state: "/dashboard",
      });
    });
  });

  it("passes current location pathname as state to navigate", async () => {
    render(
      <MemoryRouter>
        <Spinner path="home" />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home", {
        state: "/dashboard",
      });
    });
  });

  it("clears interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const { unmount } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("applies correct styling to container", () => {
    const { container } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    const mainDiv = container.querySelector(".d-flex");
    expect(mainDiv).toHaveStyle({ height: "100vh" });
  });

  it("does not navigate before count reaches 0", () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles multiple Spinner instances independently", async () => {
    const { unmount: unmount1 } = render(
      <MemoryRouter>
        <Spinner path="page1" />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    unmount1();

    const {} = render(
      <MemoryRouter>
        <Spinner path="page2" />
      </MemoryRouter>,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/page2", {
        state: "/dashboard",
      });
    });
  });
});
