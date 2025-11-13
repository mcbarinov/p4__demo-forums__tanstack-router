import { useSuspenseQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { AppError } from "@/lib/errors"
import type { User, Forum } from "@/types"

/**
 * Hook to get current user from cache
 * Current user is loaded on protected route entry and cached indefinitely
 */
export function useCurrentUser(): User {
  const { data: currentUser } = useSuspenseQuery(api.queries.currentUser())
  return currentUser
}

/**
 * Hook to get all users from cache
 * Users are loaded once on app start and cached indefinitely
 */
export function useUsers() {
  const { data: users } = useSuspenseQuery(api.queries.users())
  return users
}

/**
 * Hook to get a specific user by ID from cached users list
 */
export function useUser(userId: string): User {
  const users = useUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) {
    throw new AppError("not_found", "User not found")
  }
  return user
}

/**
 * Hook to get all forums from cache
 * Forums are loaded once on app start and cached indefinitely
 */
export function useForums() {
  const { data: forums } = useSuspenseQuery(api.queries.forums())
  return forums
}

/**
 * Hook to get a specific forum by slug from cached forums list
 */
export function useForum(slug: string): Forum {
  const forums = useForums()
  const forum = forums.find((f) => f.slug === slug)
  if (!forum) {
    throw new AppError("not_found", "Forum not found")
  }
  return forum
}
