# Login Card and Tab Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present all right-side login content inside a polished responsive card and make Tab move from username directly to password.

**Architecture:** Keep the existing `Login` component and two-column page structure. Add an accessible region to the existing `.login-card`, reorder the forgot-password link after the password controls in natural DOM order, and use CSS positioning to retain its visual placement beside the password label.

**Tech Stack:** React 19, React Router, React Testing Library, Jest through Create React App, CSS

## Global Constraints

- Enclose the right-side content from "Welcome back" through "Contact support" in one responsive card.
- Use a white background, rounded corners, a subtle border, a soft shadow, and responsive padding.
- Preserve the existing desktop and mobile layouts.
- Preserve all authentication, validation, loading, success, and navigation behavior.
- Use natural DOM order; do not add positive `tabIndex` values.

---

## File Structure

- Create `frontend/src/features/auth/pages/Login.test.js` for login-page grouping and keyboard-order tests.
- Modify `frontend/src/features/auth/pages/Login.js` only for the card region attributes and password-area markup order.
- Modify `frontend/src/features/auth/pages/Login.css` only for the card surface, forgot-password positioning, and responsive card adjustments.

### Task 1: Login card and natural keyboard navigation

**Files:**
- Create: `frontend/src/features/auth/pages/Login.test.js`
- Modify: `frontend/src/features/auth/pages/Login.js`
- Modify: `frontend/src/features/auth/pages/Login.css`

**Interfaces:**
- Consumes: the existing `Login` default export, `useAuth()`, `apiClient`, and React Router navigation context.
- Produces: an accessible region named `Account sign in`, the focus order `username -> password -> password toggle -> forgot-password link -> remember checkbox -> submit`, and a visually verified responsive `.login-card` surface.

- [ ] **Step 1: Write the failing component behavior tests**

Create `frontend/src/features/auth/pages/Login.test.js`:

```javascript
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

```

- [ ] **Step 2: Run the tests and verify the intended failures**

Run from `frontend`:

```powershell
npm test -- --watchAll=false --runTestsByPath src/features/auth/pages/Login.test.js
```

Expected: FAIL because no `Account sign in` region exists and Tab from username focuses `Forgot password?`.

- [ ] **Step 3: Add the accessible card grouping and natural DOM order**

In `frontend/src/features/auth/pages/Login.js`, give the existing card an accessible region name:

```jsx
<div className="login-card" role="region" aria-label="Account sign in">
```

Replace the password field structure so the link follows the input and toggle in DOM order:

```jsx
<div className="login-field login-password-field">
  <label htmlFor="password">Password</label>
  <div className="login-input-wrap">
    <FiLock aria-hidden="true" />
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setError("");
      }}
      autoComplete="current-password"
      disabled={loading || showModal}
      required
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword((visible) => !visible)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FiEyeOff /> : <FiEye />}
    </button>
  </div>
  <a
    className="forgot-password"
    href="mailto:support@lnhs.edu?subject=Password%20reset"
  >
    Forgot password?
  </a>
</div>
```

Do not change `handleSubmit`, authentication state, error messages, or navigation behavior.

- [ ] **Step 4: Add the card surface and preserve the link's visual alignment**

In `frontend/src/features/auth/pages/Login.css`, reduce the panel padding enough to accommodate the new card:

```css
.login-panel {
  display: grid;
  min-height: 100vh;
  padding: clamp(24px, 3.2vw, 50px);
  place-items: center;
  background:
    radial-gradient(circle at 100% 0%, rgba(54, 125, 207, 0.08), transparent 26%),
    #f7f9fc;
}
```

Replace the `.login-card` rule with:

```css
.login-card {
  box-sizing: border-box;
  width: min(100%, 500px);
  padding: clamp(30px, 3.2vw, 46px);
  background: #fff;
  border: 1px solid rgba(211, 220, 232, 0.92);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(19, 46, 82, 0.12);
}
```

Replace the obsolete `.login-label-row` selectors with:

```css
.login-field label {
  display: block;
  margin-bottom: 7px;
  color: var(--ink-700);
  font-size: 11px;
  font-weight: 700;
}

.login-password-field {
  position: relative;
}

.forgot-password {
  position: absolute;
  top: 0;
  right: 0;
}

.forgot-password:hover,
.login-help a:hover {
  text-decoration: underline;
}
```

Keep `.login-help a` in the shared link-color rule:

```css
.forgot-password,
.login-help a {
  color: var(--blue-600);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
}
```

Add focused mobile refinements inside the existing media queries:

```css
@media (max-width: 930px) {
  .login-card {
    padding: clamp(28px, 7vw, 42px);
    border-radius: 20px;
    box-shadow: 0 18px 44px rgba(19, 46, 82, 0.1);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 26px 20px;
    border-radius: 17px;
  }
}
```

- [ ] **Step 5: Run the focused tests and verify they pass**

Run from `frontend`:

```powershell
npm test -- --watchAll=false --runTestsByPath src/features/auth/pages/Login.test.js
```

Expected: both tests PASS with no test warnings or runtime errors.

- [ ] **Step 6: Run the full frontend test suite**

Run from `frontend`:

```powershell
npm test -- --watchAll=false
```

Expected: all frontend test suites PASS.

- [ ] **Step 7: Run a production build**

Run from `frontend`:

```powershell
npm run build
```

Expected: the optimized production build completes successfully without ESLint or compilation errors.

- [ ] **Step 8: Perform responsive and keyboard visual QA**

Start the frontend, open `/login`, and inspect desktop width, the `930px` breakpoint, and a mobile width at or below `480px`. Confirm the entire sign-in experience sits inside the white card, no content overflows, the forgot-password link remains aligned with the Password label, and keyboard focus follows the specified sequence.

- [ ] **Step 9: Commit the implementation**

```powershell
git add -- frontend/src/features/auth/pages/Login.js frontend/src/features/auth/pages/Login.css frontend/src/features/auth/pages/Login.test.js
git commit -m "feat: refine login card and keyboard flow"
```
