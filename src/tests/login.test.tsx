import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import { DEMO_EMAIL, DEMO_PASSWORD, isAuthenticated } from "@/lib/auth";

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

  it("shows an error on invalid credentials and stays on /login", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "wrong@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
  });

  it("navigates past the gate on valid demo credentials", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: DEMO_EMAIL } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: DEMO_PASSWORD } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
