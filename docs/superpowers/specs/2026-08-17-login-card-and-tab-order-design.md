# Login Card and Tab Order Design

## Goal

Improve the login page's right side by presenting all sign-in content inside a polished card and making keyboard navigation move from the username field directly to the password field.

## Scope

- Enclose the right-side content from "Welcome back" through "Contact support" in one responsive card.
- Give the card a white background, rounded corners, a subtle border, a soft shadow, and responsive padding.
- Preserve the existing two-column desktop layout and single-column mobile layout.
- Preserve all login submission, validation, loading, success, and navigation behavior.
- Change the focus order without using positive `tabIndex` values.

## Component and Layout Changes

The existing `.login-card` element will remain the semantic container for the complete right-side experience. Its CSS will change from an unstyled width constraint into the visible card requested by the user. The surrounding `.login-panel` will continue to center the card and provide the right-side background.

Desktop styling will use generous padding, a restrained border radius, a light border, and a soft shadow. Mobile styling will reduce card padding and shadow strength so the card remains comfortable within the viewport. Existing heading, form, and support-footer spacing will be adjusted only where necessary to fit the new container.

## Keyboard Navigation

The password field's "Forgot password?" link currently precedes the password input in document order. The markup will be rearranged so the password input appears first in focus order while CSS keeps the link visually aligned with the password label.

The expected focus sequence is:

1. Username input
2. Password input
3. Show or hide password button
4. Forgot password link
5. Keep me signed in checkbox
6. Sign in button

This will use natural DOM order rather than positive `tabIndex` values, preserving predictable and accessible keyboard behavior.

## Error Handling and Data Flow

No authentication data flow or error handling changes are required. Username and password state, API submission, error messages, loading state, and successful-login redirection will behave exactly as they do now.

## Testing

Add focused component tests that verify:

- The complete right-side content is contained by the login card.
- Pressing Tab from the username field focuses the password field next.
- The remaining interactive controls follow the intended natural focus order.

After implementation, run the focused test file and the frontend test suite. Run a production build to catch compile or CSS integration errors.

## Success Criteria

- All content from "Welcome back" through "Contact support" appears inside a coherent designed card.
- The card remains usable and visually balanced on desktop and mobile breakpoints.
- Pressing Tab in the username field focuses the password field, not "Forgot password?".
- Existing login behavior remains unchanged.
