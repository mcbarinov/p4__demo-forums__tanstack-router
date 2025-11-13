import { z } from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { api } from "@/lib/api"
import { AppError } from "@/lib/errors"

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
})

const formSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(2).max(100),
})

type LoginForm = z.infer<typeof formSchema>

function RouteComponent() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const loginMutation = api.mutations.useLogin()

  const form = useForm<LoginForm>({ resolver: zodResolver(formSchema), defaultValues: { username: "", password: "" } })

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Logged in successfully")
        void navigate({ to: redirect ?? "/" })
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border rounded p-6 w-80">
        <h1 className="text-xl font-bold mb-4">DemoForums</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="username" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="password" placeholder="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {loginMutation.error && (
              <div className="text-sm text-red-600">{AppError.fromUnknown(loginMutation.error).message}</div>
            )}

            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
