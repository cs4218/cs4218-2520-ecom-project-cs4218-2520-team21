import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

jest.mock("axios");

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    axios.defaults.headers.common = {};
  });

  it("should provide initial auth state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const [auth] = result.current;
    expect(auth).toEqual({
      user: null,
      token: "",
    });
  });

  it("should load auth data from localStorage on mount", () => {
    const mockAuthData = {
      user: { id: 1, name: "John Doe", email: "john@example.com" },
      token: "mockToken123",
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith("auth");

    const [auth] = result.current;
    expect(auth.user).toEqual(mockAuthData.user);
    expect(auth.token).toEqual(mockAuthData.token);
  });

  it("should not load auth data when localStorage is empty", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith("auth");

    const [auth] = result.current;
    expect(auth).toEqual({
      user: null,
      token: "",
    });
  });

  it("should set axios default authorization header with token", () => {
    const mockAuthData = {
      user: { id: 1, name: "John Doe" },
      token: "mockToken123",
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

    renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(axios.defaults.headers.common["Authorization"]).toBe("mockToken123");
  });

  it("should set empty token in axios header when no auth", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const [auth] = result.current;
    expect(auth.token).toBe("");
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  it("should update axios header when auth token changes", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(axios.defaults.headers.common["Authorization"]).toBe(
      "",
    );

    const newAuthData = {
      user: { id: 1, name: "John Doe" },
      token: "updatedToken789",
    };

    act(() => {
      const [, setAuth] = result.current;
      setAuth(newAuthData);
    });

    expect(axios.defaults.headers.common["Authorization"]).toBe(
      "updatedToken789",
    );
  });

  it("should handle invalid JSON in localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");

    expect(() => {
      renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });
    }).toThrow();
  });
});
