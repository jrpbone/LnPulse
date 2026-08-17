import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import apiClient from "../../../shared/api/client";
import Login from "./Login";

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("../../../shared/api/client", () => ({
  post: jest.fn(),
}));

jest.mock("../../../core/auth/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const renderLogin = () => render(<Login />);

beforeEach(() => {
  jest.clearAllMocks();
});

test("groups the complete sign-in experience inside the account card", () => {
  renderLogin();

  const card = screen.getByRole("region", { name: "Account sign in" });

  expect(within(card).getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  expect(within(card).getByRole("textbox", { name: "Username" })).toBeVisible();
  expect(within(card).getByRole("link", { name: "Contact support" })).toBeVisible();
});

test("moves focus from username to password before account-recovery controls", () => {
  renderLogin();

  const username = screen.getByLabelText("Username");
  const password = screen.getByLabelText("Password");

  username.focus();
  userEvent.tab();
  expect(password).toHaveFocus();

  userEvent.tab();
  expect(screen.getByRole("button", { name: "Show password" })).toHaveFocus();

  userEvent.tab();
  expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveFocus();

  userEvent.tab();
  expect(screen.getByRole("checkbox", { name: "Keep me signed in on this device" })).toHaveFocus();

  userEvent.tab();
  expect(screen.getByRole("button", { name: "Sign in" })).toHaveFocus();
});

test("does not create a privileged session when database authentication fails", async () => {
  apiClient.post.mockRejectedValueOnce({
    response: { data: { message: "Invalid username or password" } },
  });
  renderLogin();

  await userEvent.type(screen.getByLabelText("Username"), "admin");
  await userEvent.type(screen.getByLabelText("Password"), "admin");
  userEvent.click(screen.getByRole("button", { name: "Sign in" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid username or password"
  );
  expect(mockLogin).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});
