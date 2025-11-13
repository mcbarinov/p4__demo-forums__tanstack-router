import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Forum } from "@/types"

interface ForumCardProps {
  forum: Forum
}

export default function ForumCard({ forum }: ForumCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{forum.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{forum.description}</CardDescription>
      </CardContent>
    </Card>
  )
}
