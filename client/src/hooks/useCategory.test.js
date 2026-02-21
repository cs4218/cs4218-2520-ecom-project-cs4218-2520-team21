// Xenos Fiorenzo Anong, A0257672U
import React from "react";
import { renderHook, cleanup, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

jest.mock("axios");

const consoleSpy = jest.spyOn(console, "log");

afterEach(() => cleanup());
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("useCategory hook", () => {
  const fakeCategories = ["ho"];
  it("should update categories state on successful data fetch", async () => {
    const res = { data: { category: fakeCategories } };
    axios.get.mockResolvedValue(res);

    const { result } = renderHook(() => useCategory());

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => expect(result.current).toEqual(fakeCategories));
  });

  it("should log error to console on failed data fetch", async () => {
    axios.get.mockRejectedValue({ data: null });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    expect(consoleSpy).toHaveBeenCalled();
  });
});
