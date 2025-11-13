import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/")({
  component: ForumListComponent,
})

function ForumListComponent() {
  return (
    <div>
      <h1>ForumList</h1>
    </div>
  )
}
