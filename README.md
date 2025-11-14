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

### Authentication Flow

**Multi-layer authentication defense (defense in depth):**

The app uses two complementary mechanisms to handle authentication failures. Both are necessary and serve different purposes:

**1. Route Guard (`_auth.beforeLoad`)** - First layer of defense

Prevents entering protected routes without valid session:

```typescript
// src/routes/_auth/route.tsx
beforeLoad: async ({ context, location }) => {
  const currentUser = await context.queryClient.ensureQueryData(api.queries.currentUser())
  return { currentUser }
}
```

- **When:** User navigates to protected route (e.g., opens `/forums/tech` in new tab)
- **Trigger:** Navigation attempt to any route under `_auth/`
- **Behavior:**
  - Fetches current user data before rendering route
  - Redirects to `/login` with original URL preserved for post-login redirect
  - Handles both 401 (unauthorized) and 403 (forbidden) errors

**2. Runtime Session Guard (`ky.afterResponse`)** - Second layer of defense

Catches session expiration during user activity:

```typescript
// src/lib/api.ts - ky hooks
afterResponse: [
  async (_request, _options, response) => {
    if (response.status === 401) {
      void router.navigate({ to: "/login", search: { redirect: window.location.href } })
    }
  },
]
```

- **When:** Session expires while user is actively working (e.g., clicks "Create Comment" after 30 minutes of inactivity)
- **Trigger:** Any API call returns 401
- **Behavior:**
  - Intercepts ALL 401 responses from any API call (mutations, queries, background refetches)
  - Redirects to `/login` with current URL preserved for post-login redirect
  - Prevents user confusion from "random" API errors

**Why both mechanisms are needed:**

| Scenario                                             | Handler       | Without it...                                        |
| ---------------------------------------------------- | ------------- | ---------------------------------------------------- |
| Direct navigation to `/forums/tech` while logged out | Route Guard   | Protected route renders without user context → crash |
| Session expires while on `/forums/tech/posts/1`      | Runtime Guard | Mutations fail with confusing errors → poor UX       |
| Opens `/forums/tech` in new tab after logout         | Route Guard   | User sees protected content briefly → security issue |

This is **not duplication** - it's layered defense ensuring authentication is validated at both route entry and runtime.

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
- TanStack Router's `notFoundComponent` for non-existent routes
- Derived cache access (e.g., `useUser(id)`) throws `AppError` if not found - caught by error boundaries

**Two types of 404 handling:**

1. **Route 404** (non-existent URL like `/random-url`)
   - Handled by `notFoundComponent` configured in `_auth` route
   - Shows dedicated 404 page with Alert
   - Example: User navigates to `/forums/random-url` that doesn't match any route

2. **Resource 404** (non-existent resource like `/forums/tech/999` or missing user in cache)
   - API errors and cache misses throw `AppError("not_found")`
   - Caught by route `errorComponent` or React Error Boundary
   - Shows error alert with specific message from API or cache hook
   - Preserves detailed error messages (e.g., "Post #999 not found" vs generic "page not found")

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
