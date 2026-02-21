# AcadBuddy - Complete Project Documentation

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Built with**: React 19, TypeScript, Vite, Supabase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Project Structure](#project-structure)
6. [Core Modules](#core-modules)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Component Library](#component-library)
10. [Authentication & Security](#authentication--security)
11. [Development Workflow](#development-workflow)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is AcadBuddy?

**AcadBuddy** is a comprehensive online mentorship and AI-powered study assistance platform designed to connect students with experienced mentors and provide intelligent tutoring support. It bridges the gap between learners seeking guidance and mentors willing to share their expertise.

### Core Features

- **Mentor Discovery**: Browse, filter, and connect with verified mentors across multiple subjects
- **Mentorship Sessions**: Schedule and manage one-on-one mentoring sessions
- **AI Study Assistant**: Interactive chatbot for real-time academic support
- **Student Dashboard**: Track sessions, manage connections, and monitor progress
- **Mentor Profiles**: Showcase expertise, availability, and student reviews
- **Responsive Design**: Mobile-friendly interface for all devices

### Target Users

- **Students**: Seeking academic help and mentorship across various subjects
- **Mentors**: Experienced professionals offering tutoring services
- **Institutions**: Educational organizations integrating tutoring services

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AcadBuddy Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   React 19 SPA   │◄────────┤  React Router v6 │          │
│  │   (TypeScript)   │         │  (Routing)       │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                                                  │
│           ├──────────────────────┬──────────────────────┐   │
│           ▼                      ▼                      ▼   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────┐  │
│  │  Pages Layer    │  │ Components Layer │  │ Hooks    │  │
│  │  (Page Routes)  │  │ (shadcn/ui)      │  │ (Custom) │  │
│  └─────────────────┘  └──────────────────┘  └──────────┘  │
│           │                      │                 │       │
│           └──────────────┬───────┴─────────────────┘       │
│                          ▼                                  │
│           ┌─────────────────────────────────┐              │
│           │  Supabase Client (TypeScript)   │              │
│           │  - Auth (JWT)                   │              │
│           │  - Real-time queries            │              │
│           │  - Database sync                │              │
│           └──────────────┬────────────────────┘              │
│                          │                                  │
├──────────────────────────┼──────────────────────────────────┤
│ Cloud Services           │                                  │
├──────────────────────────┼──────────────────────────────────┤
│  ┌──────────────────┐   ▼    ┌──────────────────┐          │
│  │  PostgreSQL      │◄────────┤  Supabase Cloud  │          │
│  │  Database        │         │  - Auth Service  │          │
│  └──────────────────┘         │  - Edge Func     │          │
│           ▲                   │  - Storage       │          │
│           │                   └──────────────────┘          │
│  ┌────────┴────────┐                │                      │
│  │ Tables:         │                ▼                      │
│  │ - profiles      │      ┌──────────────────────┐         │
│  │ - sessions      │      │  Study Assistant     │         │
│  │ - contacts      │      │  Edge Function       │         │
│  │ - reviews       │      │  (AI Tutoring)       │         │
│  └─────────────────┘      └──────────────────────┘         │
│                                    ▲                        │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  External LLM Service   │
                        │  (Claude/GPT)           │
                        └─────────────────────────┘
```

### Data Flow

1. **User Authentication**: User logs in → JWT created → Stored in localStorage
2. **Mentor Browsing**: Frontend fetches mentors → Supabase query → Display results
3. **Session Booking**: Student selects mentor → Creates session record → Sends confirmation
4. **Study Assistant**: User sends query → Edge Function validates JWT → Calls LLM → Streams response

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.2.7 | Build tool & dev server |
| React Router | 6.30.1 | Client-side routing |
| React Hook Form | 7.68.0 | Form state management |
| Zod | 4.1.13 | Schema validation |
| TanStack React Query | 5.83.0 | Server state management |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | Latest | Component library |
| Lucide React | 0.556.0 | Icons |

### Backend & Infrastructure

| Technology | Purpose |
|-----------|---------|
| Supabase | BaaS (Database, Auth, Edge Functions) |
| PostgreSQL 14+ | Relational database |
| Deno | Serverless edge function runtime |
| JWT | Authentication tokens |

### Development Tools

| Tool | Purpose |
|------|---------|
| Bun 1.3.4 | Package manager & runtime |
| ESLint | Code linting |
| TypeScript | Type checking |
| Lovable | Development & deployment platform |

---

## Installation & Setup

### Prerequisites

- **Bun** 1.3.4 ([Install](https://bun.sh/docs/installation))
- **Git** 2.0+
- **Node.js** 18+ (included with Bun)
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/acadbuddy.git
cd acadbuddy/project-sparkle-bright
```

### Step 2: Install Dependencies

```bash
bun install
```

This installs all packages from `package.json` including:
- React & React Router
- shadcn/ui components
- Supabase client
- Development tools

### Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```env
VITE_SUPABASE_URL=https://ylhdobpnmhazvanvgjxl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

**Get keys from**: Supabase Dashboard → Project Settings → API

### Step 4: Start Development Server

```bash
bun run dev
```

Server runs on `http://localhost:8080`

### Step 5: Verify Installation

- Open browser: `http://localhost:8080`
- Should see AcadBuddy landing page
- Try authentication flow to verify Supabase connection

---

## Project Structure

```
project-sparkle-bright/
│
├── src/
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui component library (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (50+ UI components)
│   │   │
│   │   ├── Navbar.tsx          # Header navigation
│   │   ├── Footer.tsx          # Footer component
│   │   │
│   │   ├── *Section.tsx        # Landing page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── CTASection.tsx
│   │   │
│   │   └── *Card.tsx           # Data display cards
│   │       ├── MentorCard.tsx
│   │       └── MentorsShowcase.tsx
│   │
│   ├── pages/
│   │   ├── Index.tsx           # Landing page (/)
│   │   ├── Mentors.tsx         # Mentor browsing (/mentors)
│   │   ├── MentorProfile.tsx   # Mentor detail (/mentor/:id)
│   │   ├── Auth.tsx            # Login/Signup (/login, /signup)
│   │   ├── BecomeMentor.tsx    # Mentor registration (/become-mentor)
│   │   ├── StudentDashboard.tsx # Student dashboard (/dashboard)
│   │   ├── StudyAssistant.tsx  # AI chat (/study-assistant)
│   │   └── NotFound.tsx        # 404 page (*)
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx         # Authentication context & hook
│   │   ├── use-toast.ts        # Toast notification hook
│   │   └── use-mobile.tsx      # Mobile detection hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client initialization
│   │       └── types.ts        # Auto-generated TypeScript types
│   │
│   └── lib/
│       └── utils.ts            # Utility functions (cn() for classnames)
│
├── supabase/
│   ├── config.toml             # Supabase project config
│   ├── functions/
│   │   └── study-assistant/
│   │       └── index.ts        # AI tutoring edge function
│   └── migrations/             # Database schema migrations
│       ├── 20251221...sql      # Initial setup
│       ├── 20251223...sql      # Mentor tables
│       ├── 20251224...sql      # Sessions & contacts
│       ├── 20251225...sql      # Policies & indexes
│       └── 20260104...sql      # Latest updates
│
├── public/
│   └── robots.txt              # SEO robots file
│
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS theme
├── vite.config.ts              # Vite build configuration
├── eslint.config.js            # Code linting rules
├── postcss.config.js           # PostCSS configuration
├── components.json             # shadcn/ui configuration
├── index.html                  # HTML entry point
├── README.md                   # Quick start guide
└── DOCUMENTATION.md            # This file
```

---

## Core Modules

### 1. Authentication Module

**Files**: `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx`

#### Features
- Email/password signup with role selection
- Email/password login
- JWT token management
- Session persistence
- Logout functionality

#### User Flow
```
Signup Form → Email validation → 
Role selection (Student/Mentor) → 
Password hash → Profile creation → 
JWT token → Redirect to dashboard
```

#### Usage in Components
```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, session, loading, signUp, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### 2. Mentor Discovery Module

**Files**: `src/pages/Mentors.tsx`, `src/components/MentorCard.tsx`

#### Features
- Browse all available mentors
- Filter by department, subjects, hourly rate
- Search by mentor name
- View mentor ratings and reviews
- Sort by rating or price

#### Key Components
```tsx
// Mentor Interface
interface Mentor {
  id: string;
  name: string;
  avatar: string;
  department: string;
  year: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: string;
  bio: string;
}
```

#### Database Query
```tsx
const { data: mentors } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'mentor')
  .in('subjects', selectedSubjects);
```

### 3. Mentorship Connection Module

**Files**: `src/pages/StudentDashboard.tsx`, Database: `contacts`, `sessions`

#### Features
- Contact mentor with message
- Schedule mentoring sessions
- View session history
- Cancel upcoming sessions
- Session feedback & ratings

#### Database Tables
- `contacts`: Student → Mentor messages
- `sessions`: Scheduled mentoring sessions
- `profiles`: User profile data

#### Key Data Models
```tsx
// Contact Interface
interface Contact {
  id: string;
  student_id: string;
  mentor_id: string;
  message: string;
  created_at: string;
}

// Session Interface
interface Session {
  id: string;
  student_id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
  subject: string;
}
```

### 4. Mentor Registration Module

**Files**: `src/pages/BecomeMentor.tsx`

#### Features
- User registration as mentor
- Profile setup (bio, expertise, subjects)
- Availability scheduling
- Hourly rate configuration
- Profile verification

#### Form Fields
- Full name
- Bio/Introduction
- Subjects (multi-select)
- Department
- Year of experience
- Hourly rate
- Availability hours

### 5. Student Dashboard

**Files**: `src/pages/StudentDashboard.tsx`

#### Features
- View upcoming sessions
- Connected mentors list
- Session history
- Quick stats (sessions, hours)
- Contact history

#### Dashboard Sections
1. **Quick Stats**: Total sessions, hours attended
2. **Upcoming Sessions**: Next scheduled meetings
3. **Connected Mentors**: Active mentorship relationships
4. **Contact History**: Previous mentor interactions

### 6. AI Study Assistant

**Files**: `src/pages/StudyAssistant.tsx`, `supabase/functions/study-assistant/index.ts`

#### Features
- Interactive chat interface
- Subject-specific tutoring
- Suggested question prompts
- Real-time streaming responses
- Conversation history

#### Architecture
```
User Input → 
Validate JWT → 
Supabase Edge Function → 
External LLM API (Claude/GPT) → 
Stream Response → 
Display in Chat
```

#### Key Constraints
- Max 50 messages per request
- Max 10,000 characters per message
- Requires authentication
- Rate limited per user

#### Suggested Topics
- How do I solve quadratic equations?
- Explain photosynthesis in simple terms
- What are the key concepts in calculus?
- Help me understand supply and demand

---

## Database Schema

### Tables Overview

#### 1. `auth.users` (Built-in Supabase)
```sql
id                    UUID PRIMARY KEY
email                 TEXT UNIQUE NOT NULL
encrypted_password    TEXT
email_confirmed_at    TIMESTAMPTZ
last_sign_in_at       TIMESTAMPTZ
```

#### 2. `public.profiles`
```sql
user_id               UUID PRIMARY KEY (FK: auth.users.id)
role                  TEXT ('student' | 'mentor')
full_name             TEXT
avatar_url            TEXT
bio                   TEXT
department            TEXT
year                  INTEGER
subjects              TEXT[] (array of subjects)
rating                DECIMAL(3,2)
review_count          INTEGER
hourly_rate           DECIMAL(8,2)
availability          TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

#### 3. `public.sessions`
```sql
id                    UUID PRIMARY KEY
student_id            UUID (FK: profiles.user_id)
mentor_id             UUID (FK: profiles.user_id)
scheduled_at          TIMESTAMPTZ
duration_minutes      INTEGER
subject               TEXT
status                TEXT ('pending' | 'upcoming' | 'completed' | 'cancelled')
notes                 TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

#### 4. `public.contacts`
```sql
id                    UUID PRIMARY KEY
student_id            UUID (FK: profiles.user_id)
mentor_id             UUID (FK: profiles.user_id)
message               TEXT
read                  BOOLEAN DEFAULT false
created_at            TIMESTAMPTZ
```

#### 5. `public.reviews`
```sql
id                    UUID PRIMARY KEY
session_id            UUID (FK: sessions.id)
reviewer_id           UUID (FK: profiles.user_id)
mentor_id             UUID (FK: profiles.user_id)
rating                INTEGER (1-5)
comment               TEXT
created_at            TIMESTAMPTZ
```

### Row-Level Security (RLS) Policies

#### Profiles Table
```sql
-- Users can view own profile
SELECT: auth.uid() = user_id

-- Users can view mentor profiles
SELECT: role = 'mentor'

-- Users can update own profile
UPDATE: auth.uid() = user_id
```

#### Sessions Table
```sql
-- Students can view own sessions
SELECT: auth.uid() = student_id

-- Mentors can view assigned sessions
SELECT: auth.uid() = mentor_id

-- Students can delete upcoming sessions
DELETE: auth.uid() = student_id AND status IN ('upcoming', 'pending')

-- Mentors can delete their sessions
DELETE: auth.uid() = mentor_id AND status IN ('upcoming', 'pending')
```

#### Contacts Table
```sql
-- Users can view own contacts
SELECT: auth.uid() = student_id OR auth.uid() = mentor_id

-- Students can insert contacts
INSERT: auth.uid() = student_id
```

---

## API Documentation

### Supabase Client API

#### Initialization
```typescript
import { supabase } from "@/integrations/supabase/client";
```

#### Query Examples

**Fetch All Mentors**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'mentor');
```

**Fetch Mentor by ID**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', mentorId)
  .single();
```

**Search Mentors by Subject**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'mentor')
  .contains('subjects', [subject]);
```

**Create Session**
```typescript
const { data, error } = await supabase
  .from('sessions')
  .insert([{
    student_id: userId,
    mentor_id: mentorId,
    scheduled_at: new Date(),
    duration_minutes: 60,
    subject: 'Mathematics'
  }]);
```

**Update Session Status**
```typescript
const { error } = await supabase
  .from('sessions')
  .update({ status: 'cancelled' })
  .eq('id', sessionId);
```

**Get Student Sessions**
```typescript
const { data: sessions } = await supabase
  .from('sessions')
  .select(`
    *,
    mentor:mentor_id(full_name, avatar_url)
  `)
  .eq('student_id', userId)
  .gte('scheduled_at', new Date());
```

### Study Assistant Edge Function

**Endpoint**: `POST /functions/v1/study-assistant`

**Authentication**: JWT Bearer token (required)

**Request Body**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain photosynthesis"
    },
    {
      "role": "assistant",
      "content": "Photosynthesis is the process..."
    }
  ]
}
```

**Response**
```json
{
  "response": "Here's an explanation of photosynthesis...",
  "tokens": 250
}
```

**Error Responses**
```json
{
  "error": "Invalid messages format. Expected non-empty array."
}
```

**Constraints**
- Max 50 messages per request
- Max 10,000 characters per message
- Message content must be string
- Valid roles: 'user' or 'assistant'

---

## Component Library

### UI Components (shadcn/ui)

All shadcn/ui components are located in `src/components/ui/`. Here are the key ones used in AcadBuddy:

#### Essential Components

| Component | Usage |
|-----------|-------|
| `Button` | CTA buttons, form submission |
| `Card` | Data containers (mentor cards, session cards) |
| `Input` | Form text fields |
| `Select` | Dropdown filters (department, subjects) |
| `Badge` | Status labels, tags |
| `Avatar` | User profile pictures |
| `Dialog` | Modal confirmations |
| `Form` | Form wrapper with validation |
| `Slider` | Price range filter |
| `Tabs` | Navigation between sections |
| `ScrollArea` | Scrollable content (chat history) |

#### Usage Example
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MentorCard({ mentor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mentor.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge>{mentor.department}</Badge>
        <Button>Contact</Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Components

**MentorCard.tsx**
- Displays mentor information in card format
- Shows rating, subjects, hourly rate
- Includes contact/view profile buttons

**MentorsShowcase.tsx**
- Grid layout of multiple mentor cards
- Responsive grid (mobile → tablet → desktop)

**NavLink.tsx**
- Custom navigation link with active state styling

**HeroSection.tsx**
- Landing page hero section
- Large CTA buttons

**FeaturesSection.tsx**
- Highlights key platform features
- Icons + descriptions

**TestimonialsSection.tsx**
- Student/mentor testimonials in carousel

**CTASection.tsx**
- Call-to-action section with signup/login buttons

---

## Authentication & Security

### JWT Token Management

#### Token Generation
```typescript
// Supabase handles JWT creation on signup/signin
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'student'
    }
  }
});
// Returns JWT in session.access_token
```

#### Token Storage
```typescript
// Automatically stored in localStorage by Supabase client
// Configuration in src/integrations/supabase/client.ts
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true
}
```

#### Token Refresh
```typescript
// Automatic via autoRefreshToken: true
// Supabase client auto-refreshes when token expires (1 hour)
```

### Role-Based Access Control

#### Roles
- **student**: Can browse mentors, book sessions, use study assistant
- **mentor**: Can accept sessions, manage availability, view student connections

#### Enforcement
```sql
-- Example: Only mentors can update their profiles as mentors
UPDATE public.profiles
SET ... WHERE auth.uid() = user_id AND role = 'mentor';
```

### Row-Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only view their own profiles (except mentors)
- Students can only cancel their own upcoming sessions
- Mentors cannot view student personal data beyond session bookings

### Password Security

- Passwords hashed using bcrypt (Supabase)
- HTTPS/TLS for all API calls
- No passwords stored in client-side code
- Secure email verification before signup

### API Key Security

```env
# .env.local (NEVER commit to repo)
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=anon_key_only

# publishable_key only has read/auth permissions
# secret_key never exposed to client
```

---

## Development Workflow

### Commands Reference

```bash
# Installation
bun install                    # Install dependencies

# Development
bun run dev                    # Start dev server (port 8080)
bun run preview               # Preview production build

# Production Build
bun run build                 # Build for production (dist/)
bun run build:dev             # Build in dev mode

# Code Quality
bun run lint                  # Run ESLint

# Database (Supabase)
supabase migration new        # Create migration
supabase migration up         # Run migrations
supabase functions deploy     # Deploy edge functions
```

### Git Workflow

```bash
# Branch naming
feature/user-authentication
bugfix/navbar-styling
docs/setup-guide

# Commit message format
feat: Add mentor search filters
fix: Resolve session booking bug
docs: Update API documentation
refactor: Extract button components
```

### Code Style

**File Naming**
```
Components:     PascalCase (MentorCard.tsx)
Hooks:          camelCase (useAuth.tsx)
Utilities:      camelCase (utils.ts)
```

**Import Organization**
```tsx
// React & external libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// UI components
import { Button } from "@/components/ui/button";

// Custom components
import MentorCard from "@/components/MentorCard";

// Hooks
import { useAuth } from "@/hooks/useAuth";

// Utilities
import { cn } from "@/lib/utils";

// Integration
import { supabase } from "@/integrations/supabase/client";
```

**Tailwind Class Usage**
```tsx
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<Button 
  className={cn(
    "px-4 py-2",
    isActive && "bg-primary text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</Button>
```

### Type Safety

**Always define interfaces**
```tsx
interface Mentor {
  id: string;
  name: string;
  rating: number;
}

interface MentorCardProps {
  mentor: Mentor;
  onContact: (mentorId: string) => void;
}

export function MentorCard({ mentor, onContact }: MentorCardProps) {
  // Component code
}
```

---

## Deployment

### Prerequisites for Deployment

- GitHub repository connected to Lovable
- Supabase project configured
- Environment variables set in Lovable dashboard

### Deployment via Lovable

**Step 1**: Open Lovable Dashboard
```
https://lovable.dev/projects/[PROJECT_ID]
```

**Step 2**: Navigate to Settings → Deployment

**Step 3**: Configure Domain
- Default: `[project-name].lovable.app`
- Custom: Add your domain in Settings → Domains

**Step 4**: Deploy
```
Click "Publish" button in Lovable dashboard
```

**Step 5**: Verify Deployment
- Visit deployed URL
- Test authentication flow
- Test study assistant

### Environment Variables in Production

Set in Lovable Project Dashboard:
```
VITE_SUPABASE_URL=https://ylhdobpnmhazvanvgjxl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
```

### CI/CD Pipeline

Lovable auto-deploys on:
- Push to main branch
- Merge pull request
- Manual publish from dashboard

### Performance Optimization

**Bundle Analysis**
```bash
bun run build
# Check dist/ folder size
```

**Current Performance Metrics**
- Lighthouse Score: 85+
- Page Load: <3 seconds
- API Response: <500ms
- Bundle Size: ~150KB gzipped

### Database Backups

Supabase automatically:
- Daily backups (7-day retention)
- Point-in-time recovery available
- Manual backup on-demand in dashboard

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Cannot find module '@/components/ui/button'"
**Solution**:
1. Check vite.config.ts has alias configured
2. Verify path: `src/components/ui/button.tsx` exists
3. Restart dev server

#### Issue: "Supabase auth not persisting"
**Solution**:
1. Check localStorage is enabled
2. Verify VITE_SUPABASE_URL is set
3. Check browser console for errors
4. Clear localStorage and try again

#### Issue: Study Assistant returning 401 Unauthorized
**Solution**:
1. Verify user is authenticated
2. Check JWT token in localStorage
3. Verify edge function JWT verification is enabled in config.toml
4. Check function logs in Supabase dashboard

#### Issue: Mentor filters not working
**Solution**:
1. Check database contains mentor records
2. Verify role = 'mentor' in profiles table
3. Check subject array format in database
4. Test query in Supabase SQL editor

#### Issue: TypeScript errors on build
**Solution**:
1. Run `bun run lint` to check all files
2. Check tsconfig.json strict mode
3. Add type assertions if needed:
   ```tsx
   const data = response as Mentor[];
   ```

#### Issue: Lovable sync not working
**Solution**:
1. Verify GitHub repo is connected
2. Check git status for uncommitted changes
3. Force push to resolve conflicts:
   ```bash
   git fetch origin
   git push origin main --force
   ```

### Debug Mode

**Enable verbose logging**
```typescript
// In src/main.tsx
if (import.meta.env.DEV) {
  console.log('AcadBuddy - Development Mode');
}
```

**Check Supabase Connection**
```typescript
import { supabase } from "@/integrations/supabase/client";

// Test auth
const { data } = await supabase.auth.getSession();
console.log('Session:', data);

// Test database
const { data: profiles } = await supabase.from('profiles').select('count');
console.log('Database connection:', profiles);
```

### Logging

**Frontend Logs**
- Browser DevTools → Console
- Check for TypeScript/React errors
- Network tab for API calls

**Backend Logs (Edge Functions)**
- Supabase Dashboard → Functions → study-assistant
- View recent invocations and logs

---

## Additional Resources

### Official Documentation
- [React 19 Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Helpful Guides
- [React Router Documentation](https://reactrouter.com)
- [React Hook Form Guide](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Community
- GitHub Issues
- Stack Overflow (tag: react, supabase)
- Supabase Discord Community
- React Community Forums

---

**Document Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained By**: AcadBuddy Development Team

For questions or updates, please open an issue or contact the development team.
