//  Dhruvi Ketan Rathod A0259297J
// Tests and mocks were refined with the assistance of AI

import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import * as authContext from "../../context/auth";

jest.mock("../../components/AdminMenu", () => () => (
  <div>Mocked AdminMenu</div>
));

jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("AdminDashboard Component", () => {
  beforeEach(() => {
   
    jest.spyOn(authContext, "useAuth").mockReturnValue([
      {
        user: { name: "John Doe", email: "john@example.com", phone: "1234567890" },
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders admin information correctly", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Admin Name : John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 1234567890")).toBeInTheDocument();
  });

  test("renders AdminMenu component", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Mocked AdminMenu")).toBeInTheDocument();
  });

  test("renders safely when auth is null", () => {
 
    jest.spyOn(authContext, "useAuth").mockReturnValue([null]);

    render(<AdminDashboard />);
    expect(screen.getByText("Admin Name :")).toBeInTheDocument();
    expect(screen.getByText("Admin Email :")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
  });
  test("renders safely when auth.user is missing", () => {
  
    jest.spyOn(authContext, "useAuth").mockReturnValue([{ user: null }]);
    
    render(<AdminDashboard />);
    
    expect(screen.getByText("Admin Name :")).toBeInTheDocument();
    expect(screen.getByText("Admin Email :")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
});
});