import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { api } from "@/lib/api"
import Header from "./-components/layout/Header"
import Footer from "./-components/layout/Footer"

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    try {
      const currentUser = await context.queryClient.ensureQueryData(api.queries.currentUser())
      return { currentUser }
    } catch {
      // If authentication fails (401 from api/profile or no cache after logout), redirect to login page
      // TanStack Router uses `throw redirect()` as the official way to redirect in beforeLoad
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
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

function LayoutComponent() {
  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-6">
      <Header />
      <main className="flex-1 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
