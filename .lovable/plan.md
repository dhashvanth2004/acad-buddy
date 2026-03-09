

## Email Notifications via EmailJS

The project already has `@emailjs/browser` installed and an edge function (`session-notifications`) that attempts email via Resend (which has no API key configured). Instead of relying on a backend edge function, we'll use EmailJS directly from the client side for simplicity — no API keys to store server-side.

### Setup Required

EmailJS requires 3 public IDs (safe to store in code): **Service ID**, **Template IDs**, and **Public Key**. The user will need to:
1. Create a free EmailJS account at emailjs.com
2. Connect an email service (Gmail, Outlook, etc.)
3. Create 3 email templates: booking_request, booking_accepted, booking_declined
4. Get the Service ID, Template IDs, and Public Key

### Implementation Plan

**1. Create an email notification service** (`src/services/email.service.ts`)
- Import `emailjs` from `@emailjs/browser`
- Export functions: `sendBookingRequestEmail`, `sendBookingAcceptedEmail`, `sendBookingDeclinedEmail`
- Each function takes session details (mentor name, student name, date, subject) and recipient email
- Uses `emailjs.send()` with template parameters
- Fails silently (console.error) so email issues don't block core functionality
- Store EmailJS public key, service ID, and template IDs as constants (these are public/safe)

**2. Update `MentorProfile.tsx` — booking request notification**
- After successful session insert, call `sendBookingRequestEmail` with mentor details
- Replace the existing edge function call for `booking_request`

**3. Update `MentorDashboard.tsx` — accept/decline notifications**
- In `handleSessionAction`, call `sendBookingAcceptedEmail` or `sendBookingDeclinedEmail`
- Replace the existing edge function calls for `booking_accepted`/`booking_declined`

**4. Fetch recipient email**
- Since we need the recipient's email and profiles don't store emails, we'll fetch the user's profile name and use it in the template
- EmailJS templates will use dynamic `to_email` parameter — the app will need to query the email from the session data
- Alternative: Add an `email` field to profiles table so we can look it up client-side

### Key Decision Needed

EmailJS requires the recipient's email address. Currently emails are stored in `auth.users` (not accessible client-side). Options:
- **Option A**: Add an `email` column to the `profiles` table (populated on signup via the `handle_new_user` trigger)
- **Option B**: Keep using the edge function approach but switch to EmailJS server-side (less ideal)

Option A is recommended — it's a small migration + trigger update.

### Database Changes
- Add `email` column to `profiles` table
- Update `handle_new_user()` trigger to populate `NEW.email`

### Files to Create/Edit
- **Create**: `src/services/email.service.ts`
- **Edit**: `src/pages/MentorProfile.tsx` — replace edge function call with EmailJS
- **Edit**: `src/pages/MentorDashboard.tsx` — replace edge function call with EmailJS
- **Migration**: Add email to profiles, update trigger

