import { Link } from 'react-router-dom'
import { useStockListParams } from '@/hooks/useStockListParams'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Name (A-Z)', sortBy: 'title', order: 'asc' as const },
  { value: 'title-desc', label: 'Name (Z-A)', sortBy: 'title', order: 'desc' as const },
  { value: 'price-asc', label: 'Price (low-high)', sortBy: 'price', order: 'asc' as const },
  { value: 'price-desc', label: 'Price (high-low)', sortBy: 'price', order: 'desc' as const },
  { value: 'stock-asc', label: 'Stock (low-high)', sortBy: 'stock', order: 'asc' as const },
]

export function StockListPage() {
  const {
    search,
    category,
    sortBy,
    order,
    page,
    searchInput,
    setSearchInput,
    setCategory,
    setSort,
    setPage,
  } = useStockListParams()

  const { data, isLoading, isError, refetch } = useProducts({
    search,
    category,
    sortBy,
    order,
    page,
    limit: PAGE_SIZE,
  })

  const { data: categories } = useCategories()
  const { logout } = useAuth()

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const currentSortValue = `${sortBy}-${order}`

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stock</h1>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search stock…"
          aria-label="Search stock"
          className="max-w-xs"
        />

        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentSortValue}
          onValueChange={(v) => {
            const option = SORT_OPTIONS.find((o) => o.value === v)
            if (option) setSort(option.sortBy, option.order)
          }}
        >
          <SelectTrigger className="w-48" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="mb-3 text-sm text-destructive">Couldn't load stock. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.products.length === 0 && (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No items match your search or filter.
        </div>
      )}

      {!isLoading && !isError && data && data.products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.products.map((product) => (
              <Link key={product.id} to={`/items/${product.id}`}>
                <Card className="h-full space-y-2 p-4 transition-shadow hover:shadow-md">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-24 w-full rounded object-cover"
                  />
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-sm">Stock: {product.stock}</p>
                </Card>
              </Link>
            ))}
          </div>

          <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </div>
  )
}
