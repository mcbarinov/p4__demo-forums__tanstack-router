import { Link, useNavigate } from "@tanstack/react-router"
import { api } from "@/lib/api"
import { useCurrentUser } from "@/hooks/useCache"

export default function Header() {
  const currentUser = useCurrentUser()
  const logoutMutation = api.mutations.useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: "/login" })
      },
    })
  }

  return (
    <header className="flex items-center justify-between py-4 border-b">
      <Link to="/" className="text-xl font-bold">
        DemoForums
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm">{currentUser.username}</span>
        {currentUser.role === "admin" && (
          <Link to="/forums/new" className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
            Create Forum
          </Link>
        )}
        <button onClick={handleLogout} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
          Logout
        </button>
      </div>
    </header>
  )
}
