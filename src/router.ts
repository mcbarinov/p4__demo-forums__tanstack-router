import { createRouter } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"

interface RouterContext {
  queryClient: QueryClient
}

export const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  } satisfies RouterContext,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
