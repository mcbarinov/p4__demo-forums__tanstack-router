import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return <Outlet />
}

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircleIcon />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>The page you are looking for does not exist.</AlertDescription>
      </Alert>
    </div>
  )
}
