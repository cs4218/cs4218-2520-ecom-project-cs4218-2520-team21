//  Dhruvi Ketan Rathod A0259297J
// Test structures and mock configurations were developed with the assistance of AI

import React from "react";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import CreateCategory from "./CreateCategory";
import * as axios from "axios";
import toast from "react-hot-toast"


jest.mock("axios");
jest.mock("../../components/AdminMenu", () => () => <div>Mocked AdminMenu</div>);

jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));


jest.mock("../../components/Form/CategoryForm", () => ({ handleSubmit, value, setValue }) => (
  <form onSubmit={handleSubmit}>
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter new category"
    />
    <button type="submit">Submit</button>
  </form>
));
jest.mock('react-hot-toast');


describe("CreateCategory Component", () => {
  const categoriesMock = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { success: true, category: categoriesMock } });
    axios.post.mockResolvedValue({ data: { success: true } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  test("renders layout, menu, and categories", async () => {

    render(<CreateCategory />);
    

    expect(screen.getByText(/Dashboard - Create Category/)).toBeInTheDocument();
    expect(screen.getByText("Mocked AdminMenu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  test("typing in Category Form input calls setValue", async () => {
    render(<CreateCategory />);


    await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(input, { target: { value: "Toys" } });

    expect(input.value).toBe("Toys");
  });


  test("creates a new category", async () => {
   
    render(<CreateCategory />);
   

    const input = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByText("Submit");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Clothes" } });
      fireEvent.click(submitButton);
    });

    expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", {
      name: "Clothes",
    });
  });

  test("opens modal and updates category", async () => {
   
    render(<CreateCategory />);
 

    const editButton = await screen.findAllByText("Edit");
    
    await act(async () => {
      fireEvent.click(editButton[0]);
    });

    const modalInput = screen.getAllByPlaceholderText("Enter new category")[1];
    const modalSubmit = screen.getAllByText("Submit")[1];

    await act(async () => {
      fireEvent.change(modalInput, { target: { value: "Gadgets" } });
      fireEvent.click(modalSubmit);
    });

    expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", {
      name: "Gadgets",
    });
  });

  test("deletes a category", async () => {
   
    render(<CreateCategory />);
   

    const deleteButton = await screen.findAllByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton[0]);
    });

    expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1");
  });

  test("shows error toast when creating category fails", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<CreateCategory />);
    
    const input = screen.getByPlaceholderText("Enter new category");
    const submit = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "Clothes" } });
    fireEvent.click(submit);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("somthing went wrong in input form");
    });
    logSpy.mockRestore();
});

    test("shows error toast when updating category fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        
        axios.put.mockRejectedValueOnce(new Error("Server error"));
        axios.get.mockResolvedValue({
            data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });

        render(<CreateCategory />);


        const editButton = await screen.findByText("Edit");
        fireEvent.click(editButton);


        const modal = screen.getByRole("dialog"); // get modal container
        const modalInput = within(modal).getByDisplayValue("Electronics");
        const modalSubmit = within(modal).getByText("Submit");


        fireEvent.change(modalInput, { target: { value: "Gadgets" } });
        fireEvent.click(modalSubmit);


        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
        });

        logSpy.mockRestore();
    });

    test("shows error toast when deleting category fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "Electronics" }] } });
        axios.delete.mockRejectedValueOnce(new Error("Server error"));

        render(<CreateCategory />);

        const deleteButton = await screen.findByText("Delete");
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
        });
        logSpy.mockRestore();
});
    test("shows toast.error when creating category fails", async () => {
    
        axios.post.mockResolvedValueOnce({ data: { success: false, message: "Category already exists" } });

        render(<CreateCategory />);

        const input = screen.getByPlaceholderText("Enter new category");
        const submit = screen.getByText("Submit");

        fireEvent.change(input, { target: { value: "Electronics" } });
        fireEvent.click(submit);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Category already exists");
        });
    });
    test("shows toast.error when fetching categories fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        axios.get.mockRejectedValueOnce(new Error("Network Error"));

        render(<CreateCategory />);

        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
        });
        logSpy.mockRestore();
        });

});
