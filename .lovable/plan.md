

## Email Verification at Signup

### Current State
- The signup flow already shows a toast: "Please check your email to verify your account before logging in."
- The `signUp` function sets `emailRedirectTo: window.location.origin` for the confirmation link.
- However, email verification may not be enforced — users might be able to log in without confirming their email, depending on the auth configuration.

### What Needs to Change

1. **Ensure auto-confirm is disabled** — By default in Lovable Cloud, email confirmation should be required. The current code already assumes this (shows the verification message). I'll verify and configure this if needed using the `configure_auth` tool during implementation.

2. **Improve the signup UX after registration** — After successful signup, instead of just a toast, show a clear verification screen/message telling the user to check their email, with an option to resend the verification email.

3. **Handle unverified login attempts** — When a user tries to log in before verifying their email, show a clear error message explaining they need to verify first, rather than a generic "Invalid login credentials" error.

4. **Add a resend verification email option** — Allow users who haven't received the email to request it again.

### Implementation Details

- **`src/pages/Auth.tsx`**: After successful signup, display a verification notice panel (email icon, instruction text, resend button) instead of just a toast. Handle the `Email not confirmed` error on login to show a specific message with a resend option.
- **`src/hooks/useAuth.tsx`**: Add a `resendVerification` method that calls `supabase.auth.resend({ type: 'signup', email })`.
- **Auth configuration**: Ensure auto-confirm is disabled so email verification is enforced.

