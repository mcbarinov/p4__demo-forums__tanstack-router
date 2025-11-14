import type { Post } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Username } from "@/components/shared/Username"
import { formatDateTime } from "@/lib/formatters"

export function PostDetail({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{post.title}</CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>
            By <Username id={post.authorId} />
          </span>
          <span>•</span>
          <span>{formatDateTime(post.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-6 pt-6 border-t">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
