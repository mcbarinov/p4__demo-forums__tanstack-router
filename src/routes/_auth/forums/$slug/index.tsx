import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api"
import { useForum } from "@/hooks/useCache"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Username } from "@/components/shared/Username"
import { formatDate } from "@/lib/formatters"
import { Paginator } from "./-components/Paginator"

const searchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
})

export const Route = createFileRoute("/_auth/forums/$slug/")({
  validateSearch: searchSchema,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(api.queries.posts(params.slug))
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

  const handlePageChange = (newPage: number) => {
    void navigate({ search: { page: newPage, pageSize: search.pageSize } })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    void navigate({ search: { page: 1, pageSize: newPageSize } })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{forum.title}</h1>
          <p className="text-muted-foreground">{forum.description}</p>
        </div>
        <Button onClick={() => void navigate({ to: `/forums/${slug}/new` as never })}>New Post</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead className="w-32">Date</TableHead>
            <TableHead className="w-40">Author</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No posts yet. Be the first to create one!
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow
                key={post.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => void navigate({ to: `/forums/${slug}/${String(post.number)}` as never })}
              >
                <TableCell className="font-medium">{post.number}</TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell>
                  <Username id={post.authorId} />
                </TableCell>
                <TableCell>{post.title}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={currentPageSize}
        totalCount={paginatedData.totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
