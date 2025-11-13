import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginatorProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Paginator({ currentPage, totalPages, pageSize, totalCount, onPageChange, onPageSizeChange }: PaginatorProps) {
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    onPageSizeChange(Number(newPageSize))
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const renderPageNumbers = () => {
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNumber: number
      if (totalPages <= 5) {
        pageNumber = i + 1
      } else if (currentPage <= 3) {
        pageNumber = i + 1
      } else if (currentPage >= totalPages - 2) {
        pageNumber = totalPages - 4 + i
      } else {
        pageNumber = currentPage - 2 + i
      }

      if (pageNumber === 1 || pageNumber === totalPages) {
        return (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              onClick={() => {
                handlePageChange(pageNumber)
              }}
              isActive={currentPage === pageNumber}
              className="cursor-pointer"
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if ((currentPage > 4 && i === 0) || (currentPage < totalPages - 3 && i === 4)) {
        return (
          <PaginationItem key={`ellipsis-${String(i)}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      if (pageNumber > 1 && pageNumber < totalPages) {
        return (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              onClick={() => {
                handlePageChange(pageNumber)
              }}
              isActive={currentPage === pageNumber}
              className="cursor-pointer"
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        )
      }

      return null
    }).filter(Boolean)
  }

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

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  handlePageChange(currentPage - 1)
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {renderPageNumbers()}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  handlePageChange(currentPage + 1)
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
