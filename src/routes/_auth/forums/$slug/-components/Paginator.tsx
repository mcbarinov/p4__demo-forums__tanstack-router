import type { UseNavigateResult } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginatorProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  navigate: UseNavigateResult<string>
}

export function Paginator({ currentPage, totalPages, pageSize, totalCount, navigate }: PaginatorProps) {
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    void navigate({
      search: { page: newPage, pageSize } as never,
    })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    void navigate({
      search: { page: 1, pageSize: Number(newPageSize) } as never,
    })
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalCount} posts
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handlePageChange(currentPage - 1)
          }}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handlePageChange(currentPage + 1)
          }}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
