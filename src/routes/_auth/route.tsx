import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router"
import { api } from "@/lib/api"
import { AppError } from "@/lib/errors"
import { ErrorBoundary } from "@/components/errors/ErrorBoundary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import Header from "./-components/layout/Header"
import Footer from "./-components/layout/Footer"

export const Route = createFileRoute("/_auth")({
  // ROUTE GUARD (1st layer of auth defense)
  // Prevents entering protected routes without valid session
  // This is different from ky.afterResponse which handles runtime session expiration
  // Both mechanisms are needed:
  // - beforeLoad: Guards route entry, preserves original URL for post-login redirect
  // - afterResponse: Catches session expiration during runtime (e.g., mutations, background refetches)
  beforeLoad: async ({ context, location }) => {
    try {
      const currentUser = await context.queryClient.ensureQueryData(api.queries.currentUser())
      return { currentUser }
    } catch (error) {
      const appError = AppError.fromUnknown(error)

      // Only redirect to login for authentication/authorization errors
      // Other errors (500, network) will be handled by errorComponent
      if (appError.code === "unauthorized" || appError.code === "forbidden") {
        // TanStack Router uses `throw redirect()` as the official way to redirect in beforeLoad
        // The original URL is preserved via search.redirect for post-login redirect
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        })
      }

      // Re-throw other errors to be caught by errorComponent
      throw error
    }
  },
  loader: async ({ context }) => {
    // Preload forums and users in parallel
    // These are cached indefinitely and will be available throughout the app via useCache hooks
    await Promise.all([
      context.queryClient.ensureQueryData(api.queries.forums()),
      context.queryClient.ensureQueryData(api.queries.users()),
    ])
  },
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
  component: LayoutComponent,
})

function LoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>
  )
}

function ErrorComponent({ error }: { error: Error }) {
  const appError = AppError.fromUnknown(error)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircleIcon />
        <AlertTitle>{appError.title}</AlertTitle>
        <AlertDescription>{appError.message}</AlertDescription>
      </Alert>
    </div>
  )
}

function LayoutComponent() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-6">
      <Header />
      <main className="flex-1 py-6">
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
