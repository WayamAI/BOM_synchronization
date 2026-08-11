import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import { isAuthenticated } from "@/lib/auth";

const Protected = () => (isAuthenticated() ? <div>Protected content</div> : <Navigate to="/login" replace />);

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected />} />
      </Routes>
    </MemoryRouter>,
  );

describe("login flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirects unauthenticated visitors to /login", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows an error on an invalid email and stays on /login", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "whatever" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email and a password to continue.")).toBeInTheDocument();
  });

  it("navigates past the gate on any valid email and non-empty password", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "random.person@example.org" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "any-random-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
