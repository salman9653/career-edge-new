# ⚠️ This is NOT the Next.js you know

This project runs **Next.js 16.2** with **React 19** — APIs, conventions, and file structures differ significantly from training data. **Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed all deprecation notices.

Key breaking changes:
- `middleware.ts` → renamed to `proxy.ts` (exports `proxy()` function, not `middleware()`)
- `params` and `searchParams` are now `Promise<>` types that must be `await`ed
- `use cache` directive replaces `unstable_cache`
- `unstable_retry` replaces `reset` in error boundaries
- Server Functions (formerly Server Actions) use `'use server'` directive

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2+ |
| UI Library | React | 19.2+ |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/postcss`) |
| Auth | better-auth | 1.6+ |
| Database | MongoDB | 7.x (via native driver) |
| State Mgmt | Zustand | 5.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 1.x |
| Theming | next-themes | 0.4+ |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (signin, signup)
│   ├── api/                      # API Route Handlers
│   ├── dashboard/                # Protected dashboard routes
│   ├── layout.tsx                # Root layout (Server Component)
│   ├── page.tsx                  # Landing page
│   ├── error.tsx                 # Root error boundary
│   ├── global-error.tsx          # Global error fallback
│   ├── loading.tsx               # Root loading state
│   ├── not-found.tsx             # 404 page
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # Robots.txt config
│   └── globals.css               # Global styles + design tokens
├── components/
│   ├── ui/                       # Primitives (Button, Card, Dialog, Input)
│   ├── common/                   # Shared (Navbar, ThemeProvider, FadeIn)
│   ├── auth/                     # Auth flow (SignupModal, Onboarding)
│   ├── landing/                  # Landing page sections
│   └── dashboard/                # Dashboard components
│       ├── common/               # Shared dashboard (Sidebar, Header)
│       ├── candidate/            # Candidate-specific
│       ├── company/              # Company-specific
│       └── admin/                # Admin-specific
├── hooks/                        # Custom React hooks
├── lib/                          # Server utilities (auth, db, dal)
├── store/                        # Zustand stores
├── types/                        # Shared TypeScript types
└── proxy.ts                      # Request proxy (formerly middleware)
```

### File Naming
- **Components**: `kebab-case.tsx` (e.g., `signup-modal.tsx`)
- **Hooks**: `use-camelCase.ts` (e.g., `useClickOutside.ts`)
- **Stores**: `use-camelCase.ts` (e.g., `useUIStore.ts`)
- **Types**: `kebab-case.ts` (e.g., `api-types.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `auth-client.ts`)
- **Constants**: `constants.ts` in relevant directory

### Barrel Exports
Every component directory **must** have an `index.ts` barrel export:
```typescript
// src/components/ui/index.ts
export { Button } from './button'
export { Card, CardHeader, CardContent } from './card'
export { Dialog } from './dialog'
export { Input } from './input'
```

---

## Component Architecture

### Server vs Client Component Rules

**Default to Server Components.** Only add `"use client"` when absolutely required.

| Needs | Component Type |
|---|---|
| Static content, data fetching, DB access | Server Component |
| `useState`, `useEffect`, `useReducer` | Client Component |
| Event handlers (`onClick`, `onChange`) | Client Component |
| Browser APIs (`localStorage`, `window`) | Client Component |
| Context providers (`createContext`) | Client Component |
| Third-party libs needing client features | Client Component wrapper |

### `"use client"` Minimization (Critical Rule)

**Never mark an entire page or layout as `"use client"`.** Instead:

1. Keep pages and layouts as Server Components
2. Extract **only the smallest interactive leaf** into a separate `"use client"` component
3. Pass server-fetched data as props to client components

```tsx
// ✅ CORRECT: Server Component page with minimal client leaf
// app/dashboard/page.tsx (Server Component)
import { DashboardStats } from '@/components/dashboard/common/dashboard-stats'
import { getStats } from '@/lib/dal'

export default async function DashboardPage() {
  const stats = await getStats()
  return <DashboardStats data={stats} />  // Client Component
}
```

```tsx
// ❌ WRONG: Entire page as client component
'use client'
export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  useEffect(() => { fetchStats().then(setStats) }, [])
  return <div>{/* ... */}</div>
}
```

### DRY Principles

1. **Extract repeated UI patterns** into reusable components (e.g., `FeatureCard`, `AccountTypeCard`)
2. **Centralize constants** in `src/lib/constants.ts`:
   - Navigation links, feature lists, account type options
   - Animation variants (framer-motion)
   - Form field configurations
3. **Create shared animation wrappers** (e.g., `FadeIn`, `StaggerChildren`) instead of duplicating framer-motion configs
4. **Use composition** over prop drilling — pass `children` to client wrappers

### Component Size Limits
- **Max 150 lines** per component file. If larger, decompose.
- **Max 5 props** before considering a config object or children pattern.
- **One component per file** (small helper components within the same file are acceptable).

---

## Responsiveness

All generated code **must** be responsive and adapt gracefully to:
- **Mobile**: 320px–767px
- **Tablet**: 768px–1023px
- **Desktop**: 1024px+

Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) consistently. Test layouts at 320px minimum width.

---

## Theming

- Use `next-themes` as the **sole** theming solution. Do NOT create custom Zustand theme stores.
- Every component **must** support both light and dark modes via CSS variables or Tailwind's `dark:` variant.
- Define design tokens as CSS custom properties in `globals.css`:
  ```css
  :root {
    --color-bg-primary: theme(colors.white);
    --color-text-primary: theme(colors.gray.900);
  }
  .dark {
    --color-bg-primary: theme(colors.gray.950);
    --color-text-primary: theme(colors.gray.50);
  }
  ```
- Use `suppressHydrationWarning` on `<html>` tag to prevent hydration mismatch from theme script.

---

## State Management

### Zustand Conventions
- **Union types for exclusive states** — never use multiple booleans for mutually exclusive UI states:
  ```typescript
  // ✅ CORRECT
  type ModalState = 'none' | 'signup' | 'signin' | 'onboarding'
  
  // ❌ WRONG  
  isSignUpOpen: boolean
  isSignInOpen: boolean
  isOnboardingOpen: boolean
  ```
- Add `devtools` middleware in development
- Type all store slices explicitly
- Use selectors for derived state to prevent unnecessary re-renders

---

## Proxy (formerly Middleware)

- File: `src/proxy.ts`
- Export function name: `proxy` (NOT `middleware`)
- **Do NOT rely on proxy for auth alone** — always verify auth inside Server Components and API routes independently
- Use `config.matcher` to exclude static assets:
  ```typescript
  export const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
  }
  ```

---

## Authentication Patterns

### Server Components
```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function ProtectedPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/signin')
  return <div>Welcome, {session.user.name}</div>
}
```

### API Route Handlers
```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // ... handle request
}
```

### Client Components
```typescript
'use client'
import { authClient } from '@/lib/auth-client'

export function ProfileButton() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <Skeleton />
  if (!session) return <SignInButton />
  return <Avatar user={session.user} />
}
```

---

## API Route Conventions

- Use **Route Handlers** (`app/api/.../route.ts`) exclusively
- Validate all input with proper type checking (prefer Zod when added)
- Return consistent response shapes:
  ```typescript
  // Success
  return Response.json({ data: result }, { status: 200 })
  // Error
  return Response.json({ error: 'Message' }, { status: 400 })
  ```
- Always authenticate before processing
- Use `unknown` for catch blocks, never `any`
- Add proper HTTP status codes
- Do not use placeholders for database connection details; use environment variables.

---

## Database Conventions (MongoDB)

- **Guard server modules**: Add `import 'server-only'` to `db.ts`, `auth.ts`, and `dal.ts`
- **Data Access Layer (DAL)**: All database queries go through `src/lib/dal.ts` with built-in auth verification
- **Collection naming**: `snake_case` (e.g., `candidate_profiles`)
- **Always specify database name** explicitly: `client.db('career_edge')`
- **Create indexes** for frequently queried fields (e.g., `userId`)
- **Configure connection options**:
  ```typescript
  const options: MongoClientOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    retryWrites: true,
  }
  ```

---

## Data Fetching & Caching Conventions

### Request Memoization (`react/cache`)
- Always wrap session and profile data fetching functions in React's `cache` (from `'react'`) in `dal.ts` to prevent duplicate database calls during a single page render tree.
  ```typescript
  import { cache } from 'react'
  export const getCachedSession = cache(async () => {
    return await auth.api.getSession({ headers: await headers() })
  })
  ```

### Cross-Request Caching (`"use cache"`)
- Use the `"use cache"` directive inside DAL data-retrieval functions for page/module listings.
- Attach unique cache tags formatted as `[moduleName]-[userId]` or `[moduleName]-[entityId]`.
- Trigger on-demand invalidation via `revalidateTag` in mutation endpoints (API routes or Server Actions) immediately after database updates.

### List Projections & Heavy Payload Guarding
- **Never fetch large fields** (like `resumeBase64`, heavy description blobs, or secondary object arrays) inside list queries.
- Explicitly project out large fields during list retrieval (e.g., `{ projection: { resumeBase64: 0 } }`).
- Fetch heavy fields on-demand only when a user navigates to the detailed view or triggers a download action.

### N+1 Query Elimination
- Never query references or run database counts inside a loop (e.g., `.map()`).
- Always use MongoDB `$lookup` inside an `.aggregate()` pipeline to perform single-trip database joins and counts.

### Lazy Loading & Server-Side Search
- Default to **Lazy Loading (Infinite Scroll)** instead of page-based pagination.
- Fetch the initial batch (e.g. 20 items) on the server, and expose a `GET` API endpoint to fetch subsequent pages (`?page=2&limit=20`) dynamically on scroll.
- Handle search **on the server** (Approach 1). Debounce the search input on the client by 300ms, query MongoDB using case-insensitive regex or text indexing on the server, apply pagination, and return only the matching paginated slice.

---

## TypeScript Standards

- **Strict mode** is enabled — never use `@ts-ignore` or `@ts-nocheck`
- **No `any` type** — use `unknown` and type-narrow instead
- **Explicit return types** on exported functions
- **Shared types** in `src/types/` directory
- **Prefer `interface` for objects**, `type` for unions/intersections
- **Props types** defined in the same file as the component:
  ```typescript
  interface FeatureCardProps {
    title: string
    description: string
    icon: LucideIcon
  }
  ```
- **Async params pattern** (Next.js 16):
  ```typescript
  export default async function Page({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {
    const { slug } = await params
  }
  ```

---

## Error Handling

### Required Error Boundaries
Every route segment with dynamic data **must** have:
- `error.tsx` — catches runtime errors with retry button
- `loading.tsx` — Suspense fallback for streaming

The app root **must** have:
- `app/error.tsx` — root error boundary
- `app/global-error.tsx` — catches errors in root layout (must include `<html>` and `<body>`)
- `app/not-found.tsx` — custom 404

### Error Patterns
- **Expected errors**: Return as values, not exceptions. Use `useActionState` for form errors.
- **Unexpected errors**: Throw errors, let error boundaries catch them.
- **API routes**: Always wrap in try/catch, return proper status codes.
- **Never silently swallow errors** — always log or report.

---

## Performance

- **Minimize client JS**: Push `"use client"` boundaries as deep as possible
- **Lazy load** heavy client components with `next/dynamic`
- **Use `next/image`** for all images — never raw `<img>` tags
- **Use `next/font`** for font loading — never external `<link>` tags
- **Prefer CSS animations** over JS animations for simple transitions (reduces client bundle)
- **Use React `cache()`** to memoize expensive data fetches used in both `generateMetadata` and page
- **Use `<Suspense>`** boundaries around dynamic content for streaming

---

## SEO & Metadata

Every page and layout **must** export metadata:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for search engines',
}
```

Root layout should use template pattern:
```typescript
export const metadata: Metadata = {
  title: { default: 'CareerEdge', template: '%s | CareerEdge' },
}
```

---

## Accessibility

- All interactive elements must be **keyboard navigable**
- Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`
- Add `aria-label` to icon-only buttons
- Add `aria-live="polite"` to dynamic content regions
- Dialogs must have focus trap and `aria-modal="true"`
- Forms must have associated `<label>` elements
- Add `prefers-reduced-motion` media query for animations
- Color contrast must meet WCAG 2.1 AA (4.5:1 for text)

---

## CSS & Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss` plugin
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Define design tokens as CSS variables in `globals.css`
- **Never hardcode colors** in components — always use theme variables or Tailwind tokens
- Support `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## Import Ordering

Enforce consistent import order:
1. React/Next.js imports
2. Third-party library imports
3. Internal aliases (`@/lib/`, `@/components/`, etc.)
4. Relative imports
5. Type-only imports
6. CSS imports

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Third-party
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// 3. Internal
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

// 4. Relative
import { FeatureCard } from './feature-card'

// 5. Types
import type { Metadata } from 'next'
```

---

## Security

- **Never expose secrets** — only `NEXT_PUBLIC_*` vars reach the client
- **Guard server modules** with `import 'server-only'`
- Add `Content-Security-Policy` headers via proxy or next.config.ts
- **Validate all API inputs** — never trust client data
- **OAuth secrets**: Throw errors on missing env vars, never fallback to placeholders
- Set `trustedOrigins` in better-auth config for CSRF protection
- Store sensitive files (resumes) in object storage, not MongoDB documents