import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Forum } from "@/types"

interface ForumCardProps {
  forum: Forum
}

export default function ForumCard({ forum }: ForumCardProps) {
  return (
    <Link to="/forums/$slug" params={{ slug: forum.slug }} className="block hover:no-underline">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardHeader>
          <CardTitle className="text-lg">{forum.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{forum.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
