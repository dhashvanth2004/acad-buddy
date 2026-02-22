## Project info

**URL** : [getacadbuddy.lovable.app](https://getacadbuddy.lovable.app/)

# AcadBuddy

Mentor-driven study assistant and mentorship platform with AI-powered study features.

## Overview

AcadBuddy connects students with mentors and includes an AI-powered Study Assistant. It's a Vite + React (TypeScript) app using Supabase for auth and data, and shadcn/ui + Tailwind CSS for UI.

## Tech stack

- Frontend: React 19, TypeScript, Vite
- UI: shadcn/ui (Radix), Tailwind CSS
- Backend: Supabase (Postgres, Auth, Edge Functions)
- Package manager: Bun
- Forms & Validation: React Hook Form + Zod
- State: TanStack Query (available)

## Key features

- Student and mentor roles with email/password signup
- Profile and mentor listing pages
- Chat interface and mentor reviews
- AI Study Assistant implemented as a Supabase Edge Function

## Repo structure (selected)

- `src/` — app source
  - `components/` — UI components and page sections
  - `hooks/` — custom hooks (`useAuth`, `use-toast`, etc.)
  - `integrations/supabase/` — Supabase client and types
  - `pages/` — route pages (Auth, StudyAssistant, Dashboards, etc.)
- `supabase/` — Edge functions and DB migrations

## Local setup

Prerequisites: Bun (project uses Bun). Node/npm may work for some tasks but use Bun where documented.

Install dependencies:

```bash
bun install
```

Run dev server:

```bash
bun run dev
```

Build & preview:

```bash
bun run build
bun run preview
```

Lint:

```bash
bun run lint
```

If you prefer npm/yarn, adapt commands accordingly (not guaranteed).

## Environment

- Supabase project ID and other secrets are expected to be configured in environment files or your Supabase dashboard. The repo contains `supabase/config.toml` and `supabase/functions/study-assistant/` for the edge function.





Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
