# Demo Forums - TanStack Router

Demo project for developing and testing good architectural approaches for future projects.

This is a forum application built with React and TanStack Router. The focus is on exploring routing patterns, state management, and code organization that can be reused in production applications.

> **Note:** Automated tests are not implemented at this stage.

## Project Structure

```
src/
├── routes/          # File-based routing (auto-generated route tree)
├── components/      # UI components (shadcn/ui + shared)
├── lib/             # Core utilities and API client
├── hooks/           # Custom React hooks (cache access)
└── types/           # TypeScript types (OpenAPI generated)
```

## Tech Stack

- React 19
- TypeScript 5.9
- TanStack Router 1.135
- TanStack Query 5.90
- React Hook Form + Zod
- Tailwind CSS 4
- shadcn/ui

## Architecture

### Routing Architecture

**File-based routing with TanStack Router:**

- Routes defined in `src/routes/` directory with auto-generated route tree
- Layout routes for shared logic (`_auth/route.tsx` - authentication guard)
- Data preloading via `loader` function - ensures data is ready before component renders
- Search params validation with Zod for type-safe URL state
- Route-scoped components in `-components/` directories for better organization

**Key pattern - Protected routes:**

```typescript
// src/routes/_auth/route.tsx
beforeLoad: async ({ context }) => {
  const currentUser = await context.queryClient.ensureQueryData(api.queries.currentUser())
  return { currentUser }
},
loader: async ({ context }) => {
  await Promise.all([
    context.queryClient.ensureQueryData(api.queries.forums()),
    context.queryClient.ensureQueryData(api.queries.users()),
  ])
}
```

Router cache is disabled (`defaultPreloadStaleTime: 0`) - all caching delegated to TanStack Query.

### Data Caching Strategy

We treat three resources as application-wide cache with indefinite lifetime:

```typescript
// src/lib/api.ts
currentUser: { staleTime: Infinity, gcTime: Infinity }
forums: { staleTime: Infinity, gcTime: Infinity }
users: { staleTime: Infinity, gcTime: Infinity }
```

These are loaded once on protected route entry and remain cached until explicitly invalidated.

**Access via `src/hooks/useCache.ts`:**

```typescript
const currentUser = useCurrentUser()
const forums = useForums()
const users = useUsers()
const user = useUser(userId) // Throws AppError("not_found")
const forum = useForum(slug) // Throws AppError("not_found")
```

**Invalidation strategy:**

- Login: `invalidateQueries()` - clears everything
- Logout: `removeQueries({ queryKey: ["currentUser"] })`
- Create forum: `invalidateQueries({ queryKey: ["forums"] })`

**Smart retry logic:**

- Client errors (4xx) - no retry, fail fast
- Server/network errors (5xx) - retry up to 3 times with exponential backoff
- Mutations - never retry automatically

### Error Handling

**Multi-layer error system:**

- Custom `AppError` class with typed error codes (`unauthorized`, `not_found`, `server_error`, etc.)
- Error boundaries at multiple levels: React Error Boundary + Route `errorComponent`
- Global error handling via `QueryCache` and `MutationCache` with toast notifications
- 401 responses automatically redirect to login page
- Derived cache access (e.g., `useUser(id)`) throws `AppError` if not found - caught by error boundaries

**Error display pattern:**

```typescript
// Components handle errors gracefully
{mutation.error && <ErrorMessage error={mutation.error} />}

// API errors are automatically converted to AppError
throw new AppError("not_found", "User not found")
```

### Type Safety

**End-to-end type safety:**

- OpenAPI types auto-generated from backend (`pnpm run generate-types`)
- Zod schemas for runtime validation (forms, search params, API responses)
- Strict TypeScript configuration (strict mode + all strict checks enabled)
- Type-safe routing with full inference for params, search, and context
- `as const` assertions for precise query key types

**Type generation workflow:**

```typescript
// 1. Backend defines OpenAPI schema
// 2. Generate TypeScript types: pnpm run generate-types
// 3. Import and use in API client
import type { User, Forum, Post } from "@/types"
```

## Related Projects

- **Backend API**: [p1**demo-forums**api](https://github.com/mcbarinov/p1__demo-forums__api) - FastAPI backend with in-memory storage
- **React Router Version**: [p2**demo-forums**react-router](https://github.com/mcbarinov/p2__demo-forums__react-router) - Same app built with React Router instead of TanStack Router

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Make sure the backend API is running on `http://localhost:8000` before starting the app.
