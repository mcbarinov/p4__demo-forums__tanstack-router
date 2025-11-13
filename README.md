# Demo Forums - TanStack Router

Demo project for developing and testing good architectural approaches for future projects.

This is a forum application built with React and TanStack Router. The focus is on exploring routing patterns, state management, and code organization that can be reused in production applications.

## Tech Stack

- React 19
- TypeScript 5.9
- TanStack Router 1.135
- TanStack Query 5.90
- Tailwind CSS 4
- shadcn/ui

## Architecture

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

**Loading in `src/routes/_auth/route.tsx`:**

```typescript
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

**Invalidation:**

- Login: `invalidateQueries()` - clears everything
- Logout: `removeQueries({ queryKey: ["currentUser"] })`
- Create forum: `invalidateQueries({ queryKey: ["forums"] })`

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
