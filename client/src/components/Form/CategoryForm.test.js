import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "./CategoryForm";

//  Dhruvi Ketan Rathod A0259297J
// Tests were refined with the assistance of AI

describe("CategoryForm Test", () => {
  test("renders input with correct value", () => {
    const handleSubmit = jest.fn();
    const setValue = jest.fn();
    const initialValue = "Electronics";

    render(
      <CategoryForm
        handleSubmit={handleSubmit}
        value={initialValue}
        setValue={setValue}
      />
    );

    const input = screen.getByPlaceholderText("Enter new category");
    expect(input).toBeInTheDocument();
    expect(input.value).toBe(initialValue);
  });

  test("typing in input calls setValue", () => {
    const handleSubmit = jest.fn();
    const setValue = jest.fn();

    render(
      <CategoryForm handleSubmit={handleSubmit} value="" setValue={setValue} />
    );

    const input = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(input, { target: { value: "Books" } });

    expect(setValue).toHaveBeenCalledWith("Books");
  });

  test("submitting form calls handleSubmit", () => {
    const handleSubmit = jest.fn((e) => e.preventDefault()); 
    const setValue = jest.fn();

    render(
      <CategoryForm handleSubmit={handleSubmit} value="" setValue={setValue} />
    );

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
  });
});
