import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import ky from "ky"
import { AppError } from "@/lib/errors"
import type { Forum, Post, User, LoginRequest, CreateForumData, Comment } from "@/types"
import { router } from "@/router"

const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL environment variable is required")
}

const httpClient = ky.create({
  prefixUrl: baseUrl,
  retry: 0,
  credentials: "include",
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        // RUNTIME SESSION GUARD (2nd layer of auth defense)
        // Handles authentication failures during user activity (e.g., session expired while user is working)
        // This is different from _auth.beforeLoad which guards route entry
        // Both mechanisms are needed:
        // - beforeLoad: Prevents entering protected routes without valid session
        // - afterResponse: Catches session expiration during runtime (e.g., mutations, background refetches)
        if (response.status === 401) {
          if (window.location.pathname !== "/login") {
            // Redirect to login with current URL preserved for post-login redirect
            // Uses router.navigate() to maintain SPA navigation (no full page reload)
            // The replace: true option prevents adding /login to browser history
            void router.navigate({
              to: "/login",
              search: { redirect: window.location.href },
              replace: true,
            })
          }
        }

        if (!response.ok) {
          // Shape non-OK responses into AppError with best-effort message extraction
          const code = AppError.codeFromStatus(response.status)
          let message = `HTTP ${String(response.status)} ${response.statusText}`
          try {
            const contentType = response.headers.get("content-type")
            if (contentType?.includes("application/json")) {
              const data = (await response.clone().json()) as Record<string, unknown>
              // Check both 'detail' (FastAPI standard) and 'message' fields
              if (typeof data.detail === "string" && data.detail.trim() !== "") {
                message = data.detail
              } else if (typeof data.message === "string" && data.message.trim() !== "") {
                message = data.message
              }
            }
          } catch {
            // Ignore parsing errors and use fallback message
          }
          throw new AppError(code, message)
        }

        return response
      },
    ],
  },
})

export const api = {
  queries: {
    currentUser: () =>
      queryOptions({
        queryKey: ["currentUser"],
        queryFn: () => httpClient.get("api/profile").json<User>(),
        staleTime: Infinity,
        gcTime: Infinity,
      }),

    forums: () =>
      queryOptions({
        queryKey: ["forums"],
        queryFn: () => httpClient.get("api/forums").json<Forum[]>(),
        staleTime: Infinity,
        gcTime: Infinity,
      }),

    posts: (slug: string, page?: number, pageSize?: number) =>
      queryOptions({
        queryKey: ["posts", slug, page, pageSize] as const,
        queryFn: async () => {
          // Only send parameters that are defined - let server decide defaults
          const searchParams: Record<string, number> = {}
          if (page !== undefined) searchParams.page = page
          if (pageSize !== undefined) searchParams.page_size = pageSize

          const response = await httpClient
            .get(`api/forums/${slug}/posts`, {
              searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
            })
            .json<{
              items: Post[]
              total_count: number
              page: number
              page_size: number
              total_pages: number
            }>()

          return {
            items: response.items,
            totalCount: response.total_count,
            page: response.page,
            pageSize: response.page_size,
            totalPages: response.total_pages,
          }
        },
      }),

    post: (slug: string, postNumber: string) =>
      queryOptions({
        queryKey: ["post", slug, postNumber],
        queryFn: () => httpClient.get(`api/forums/${slug}/posts/${postNumber}`).json<Post>(),
      }),

    users: () =>
      queryOptions({
        queryKey: ["users"],
        queryFn: () => httpClient.get("api/users").json<User[]>(),
        staleTime: Infinity,
        gcTime: Infinity,
      }),

    comments: (slug: string, postNumber: string) =>
      queryOptions({
        queryKey: ["comments", slug, postNumber],
        queryFn: () => httpClient.get(`api/forums/${slug}/posts/${postNumber}/comments`).json<Comment[]>(),
      }),
  },

  mutations: {
    useLogin: () => {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: (credentials: LoginRequest) => httpClient.post("api/auth/login", { json: credentials }),
        onSuccess: async () => {
          // Cookie is set automatically by the server
          // Invalidate and refetch all queries after login
          await queryClient.invalidateQueries()
        },
      })
    },

    useLogout: () => {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: () => httpClient.post("api/auth/logout"),
        onSuccess: () => {
          // Cookie is cleared automatically by the server
          // Remove currentUser from cache to force fresh fetch on next login
          queryClient.removeQueries({ queryKey: ["currentUser"] })
        },
      })
    },

    useCreateForum: () => {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: (data: CreateForumData) => httpClient.post("api/forums", { json: data }).json<Forum>(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["forums"] })
        },
      })
    },

    useCreatePost: () => {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: ({ slug, ...data }: { title: string; content: string; tags: string[]; slug: string }) =>
          httpClient.post(`api/forums/${slug}/posts`, { json: data }).json<Post>(),
        onSuccess: (_newPost, variables) => {
          void queryClient.invalidateQueries({ queryKey: ["posts", variables.slug] })
        },
      })
    },

    useCreateComment: () => {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: ({ slug, postNumber, content }: { slug: string; postNumber: string; content: string }) =>
          httpClient.post(`api/forums/${slug}/posts/${postNumber}/comments`, { json: { content } }).json<Comment>(),
        onSuccess: (_newComment, variables) => {
          void queryClient.invalidateQueries({ queryKey: ["comments", variables.slug, variables.postNumber] })
        },
      })
    },

    useChangePassword: () => {
      return useMutation({
        mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
          httpClient.post("api/profile/change-password", { json: { currentPassword, newPassword } }),
      })
    },
  },
}
