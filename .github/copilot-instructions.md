# AcadBuddy Copilot Instructions

## Project Overview

**AcadBuddy** is a mentorship and study assistance platform built with React + TypeScript, deployed via Lovable. It connects students with mentors and provides an AI-powered study assistant. The stack uses **Vite + React 19** with **Supabase** for backend/auth.

## Architecture

### Tech Stack
- **Frontend**: React 19.2, TypeScript, Vite 7
- **UI Library**: shadcn/ui (Radix UI components) + Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Package Manager**: Bun 1.3.4
- **Forms**: React Hook Form + Zod for validation
- **Icons**: Lucide React

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui component library (generated)
│   ├── *Section.tsx    # Page section components (Hero, Features, etc.)
│   └── *Card.tsx       # Data display cards (MentorCard, etc.)
├── pages/              # Route pages (Auth, Mentors, StudentDashboard, StudyAssistant)
├── hooks/              # Custom hooks (useAuth, use-toast, use-mobile)
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client setup (client.ts, types.ts)
└── lib/                # Utilities (cn() for className merging)
```

## Core Flows

### Authentication Flow
- **Provider**: `AuthProvider` in [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx)
- **Pattern**: Context API + React hooks
- **Features**: Email/password signup with role selection (student/mentor)
- **Usage**: Wrap `App` with `AuthProvider`, use `useAuth()` hook in components
- **Note**: Auth state synced via `supabase.auth.onAuthStateChange()` listener; role stored in user metadata

### Study Assistant
- **Endpoint**: Supabase Edge Function at `/functions/v1/study-assistant`
- **Location**: [src/pages/StudyAssistant.tsx](src/pages/StudyAssistant.tsx)
- **Pattern**: Chat interface with streaming responses
- **Auth**: JWT verification enforced in function config

### Data Fetching
- **Pattern**: Direct Supabase client calls (not React Query yet for most pages)
- **Location**: Imported from [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
- **Example**: `supabase.from('table').select().then()`
- **Future**: React Query setup ready but underutilized; consider migrating complex queries

## Component Patterns

### shadcn/ui Components
- All UI components in [src/components/ui/](src/components/ui/) are auto-generated from Radix UI
- **Do not manually edit UI component files** - regenerate via shadcn CLI if updating
- Use `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) to merge Tailwind classes safely
- Example: `<Button className={cn("px-4", isActive && "bg-primary")} />`

### Page Sections
- Large pages split into section components (e.g., `<HeroSection />`, `<FeaturesSection />`)
- Each section is self-contained; import icons from lucide-react
- Use Tailwind spacing utilities (not inline styles)

## Development Workflow

### Local Setup
```bash
bun install
bun run dev    # Starts Vite dev server on port 8080
```

### Build & Preview
```bash
bun run build
bun run preview
```

### Linting
```bash
bun run lint
```

### Debugging
- TypeScript strict mode enforced in [tsconfig.json](tsconfig.json)
- ESLint disabled for unused vars; rely on TypeScript for catching
- Lovable CLI component tagger available for dev mode

## Project-Specific Conventions

### File Naming
- Components: PascalCase (e.g., `MentorCard.tsx`)
- Pages: PascalCase (e.g., `StudentDashboard.tsx`)
- Utils/hooks: camelCase (e.g., `use-mobile.tsx`, `useAuth.tsx`)

### Import Aliases
- Use `@/` prefix for all relative imports (configured in vite.config.ts)
- Example: `import { useAuth } from "@/hooks/useAuth"`

### Styling
- **Theme**: CSS variables in HSL format (`hsl(var(--primary))`)
- **Font**: Plus Jakarta Sans (from @fontsource)
- **Dark Mode**: Supports `dark` class in Tailwind
- **No inline styles** - all styling via Tailwind + shadcn/ui

### Error Handling
- Use `useToast()` hook for user notifications (Sonner + Radix UI toaster)
- Example: `toast({ title: "Error", description: msg, variant: "destructive" })`

## Supabase Integration

### Environment
- Project ID: `ylhdobpnmhazvanvgjxl` (in [supabase/config.toml](supabase/config.toml))
- Client setup: [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
- Types: Auto-generated in [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)

### Edge Functions
- Study Assistant function requires JWT verification
- Located at [supabase/functions/study-assistant/](supabase/functions/study-assistant/)

### Migrations
- Database changes tracked in [supabase/migrations/](supabase/migrations/)
- Latest: Mentor/session/contact tables (Jan 2026)

## Common Tasks

### Add a New Page
1. Create component in [src/pages/](src/pages/)
2. Add route in `App.tsx`
3. Use `useAuth()` if auth-required; redirect via `useNavigate()` if needed

### Add UI Components
1. Run shadcn CLI (outside Lovable workflow) or manually copy from [shadcn/ui](https://ui.shadcn.com/)
2. Place in [src/components/ui/](src/components/ui/)
3. Import and use like: `import { Button } from "@/components/ui/button"`

### Query Supabase Data
```tsx
const { data, error } = await supabase
  .from('mentors')
  .select('*')
  .eq('department', dept);
```

### Toast Notifications
```tsx
const { toast } = useToast();
toast({ 
  title: "Success", 
  description: "Action completed" 
});
```

## External Dependencies
- **Supabase**: Authentication, database, edge functions
- **TanStack Query**: Already installed, ready for complex data fetching
- **React Router**: Single-page routing (no next.js)
- **Lovable**: Development/deployment platform (component tagger, auto-commit)

## Known Constraints
- Lovable-managed project: edits auto-commit to repo
- ESLint unused vars rule disabled (manage manually in code reviews)
- React Query setup exists but most pages use direct Supabase calls
