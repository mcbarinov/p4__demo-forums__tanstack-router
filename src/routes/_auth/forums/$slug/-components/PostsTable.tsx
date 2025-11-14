import { useNavigate } from "@tanstack/react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Username } from "@/components/shared/Username"
import { formatDate } from "@/lib/formatters"
import type { Post } from "@/types"

interface PostsTableProps {
  posts: Post[]
  slug: string
}

export function PostsTable({ posts, slug }: PostsTableProps) {
  const navigate = useNavigate()

  return (
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
              onClick={() => {
                void navigate({
                  to: "/forums/$slug/$postNumber",
                  params: { slug, postNumber: String(post.number) },
                })
              }}
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
  )
}
