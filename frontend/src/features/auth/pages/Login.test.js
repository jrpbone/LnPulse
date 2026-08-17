import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock("../../../shared/api/client", () => ({
  post: jest.fn(),
}));

jest.mock("../../../core/auth/AuthContext", () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

const renderLogin = () => render(<Login />);

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
