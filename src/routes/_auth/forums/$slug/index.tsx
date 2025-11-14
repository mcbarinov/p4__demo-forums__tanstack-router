import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api"
import { useForum } from "@/hooks/useCache"
import { Button } from "@/components/ui/button"
import { Paginator } from "./-components/Paginator"
import { PostsTable } from "./-components/PostsTable"

const searchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
})

export const Route = createFileRoute("/_auth/forums/$slug/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    pageSize: search.pageSize,
  }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(api.queries.posts(params.slug, deps.page, deps.pageSize))
  },
  component: PostListComponent,
})

function PostListComponent() {
  const { slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const forum = useForum(slug)
  const { data: paginatedData } = useSuspenseQuery(api.queries.posts(slug, search.page, search.pageSize))
  const { items: posts, page: currentPage, pageSize: currentPageSize, totalPages } = paginatedData

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{forum.title}</h1>
          <p className="text-muted-foreground">{forum.description}</p>
        </div>
        <Button onClick={() => void navigate({ to: "/forums/$slug/new", params: { slug } })}>New Post</Button>
      </div>

      <PostsTable posts={posts} slug={slug} />

      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={currentPageSize}
        totalCount={paginatedData.totalCount}
        onPageChange={(page) => void navigate({ search: (prev) => ({ ...prev, page }) })}
        onPageSizeChange={(pageSize) => void navigate({ search: (prev) => ({ ...prev, page: 1, pageSize }) })}
      />
    </div>
  )
}
