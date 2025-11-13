import { createFileRoute } from "@tanstack/react-router"
import { useForums } from "@/hooks/useCache"
import type { Forum } from "@/types"
import ForumCard from "./-components/index/ForumCard"

export const Route = createFileRoute("/_auth/")({
  component: ForumListComponent,
})

function ForumListComponent() {
  const forums = useForums()

  const groupedForums = forums.reduce<Record<string, Forum[]>>((acc, forum) => {
    acc[forum.category] ??= []
    acc[forum.category].push(forum)
    return acc
  }, {})

  return (
    <div className="container mx-auto py-8">
      {Object.entries(groupedForums).map(([category, categoryForums]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryForums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
