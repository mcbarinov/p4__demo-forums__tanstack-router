import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useForum } from "@/hooks/useCache"
import { Button } from "@/components/ui/button"
import { PostDetail } from "./-components/PostDetail"
import { CommentForm } from "./-components/CommentForm"
import { CommentList } from "./-components/CommentList"

export const Route = createFileRoute("/_auth/forums/$slug/$postNumber/")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(api.queries.post(params.slug, params.postNumber)),
      context.queryClient.ensureQueryData(api.queries.comments(params.slug, params.postNumber)),
    ])
  },
  component: PostViewComponent,
})

function PostViewComponent() {
  const { slug, postNumber } = Route.useParams()
  const forum = useForum(slug)
  const { data: post } = useSuspenseQuery(api.queries.post(slug, postNumber))
  const { data: comments } = useSuspenseQuery(api.queries.comments(slug, postNumber))

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/forums/$slug" params={{ slug }}>
            &larr; Back to {forum.title}
          </Link>
        </Button>
      </div>

      <PostDetail post={post} />
      <CommentForm slug={slug} postNumber={postNumber} />
      <CommentList comments={comments} />
    </div>
  )
}
