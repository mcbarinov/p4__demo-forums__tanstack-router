import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div>
      <h1>p4</h1>
      <Outlet />
    </div>
  )
}
