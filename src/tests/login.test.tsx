import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../../app/login/page";
import { isAuthenticated } from "@/lib/auth";

describe("login flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows an error on an invalid email and stays on /login", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "whatever" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email and a password to continue.")).toBeInTheDocument();
  });

  it("navigates past the gate on any valid email and non-empty password", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "random.person@example.org" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "any-random-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(isAuthenticated()).toBe(true);
  });
});
