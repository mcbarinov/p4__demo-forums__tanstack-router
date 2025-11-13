import { useUser } from "@/hooks/useCache"

export function Username({ id, className }: { id: string; className?: string }) {
  const user = useUser(id)
  return <span className={className}>{user.username}</span>
}
