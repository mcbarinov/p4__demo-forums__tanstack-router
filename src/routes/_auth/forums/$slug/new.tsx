import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { useForum } from "@/hooks/useCache"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ErrorMessage } from "@/components/shared/ErrorMessage"

export const Route = createFileRoute("/_auth/forums/$slug/new")({
  component: RouteComponent,
})

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content is too long"),
  tags: z.string().optional(),
})

type NewPostFormData = z.infer<typeof formSchema>

function RouteComponent() {
  const { slug } = Route.useParams()
  const navigate = Route.useNavigate()
  const forum = useForum(slug)
  const createPostMutation = api.mutations.useCreatePost()

  const form = useForm<NewPostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  })

  const onSubmit = (data: NewPostFormData) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    createPostMutation.mutate(
      {
        slug,
        title: data.title.trim(),
        content: data.content.trim(),
        tags,
      },
      {
        onSuccess: () => {
          toast.success("Post created successfully!")
          void navigate({ to: "/forums/$slug", params: { slug } })
        },
      }
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post in {forum.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter post title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Write your post content..." rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter tags separated by commas" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createPostMutation.error && <ErrorMessage error={createPostMutation.error} />}

              <div className="flex gap-2">
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Post
                </Button>
                <Button type="button" variant="outline" onClick={() => void navigate({ to: "/forums/$slug", params: { slug } })}>
                  Back to Forum
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
