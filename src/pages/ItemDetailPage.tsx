import { useState, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct } from '@/hooks/useProduct'
import { useUpdateStock } from '@/hooks/useUpdateStock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(id!)
  const { mutate, isPending, isError: isSaveError } = useUpdateStock(id!)
  const [stockInput, setStockInput] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave(e: FormEvent) {
    e.preventDefault()
    const newStock = Number(stockInput)
    if (Number.isNaN(newStock) || newStock < 0) return
    setSaved(false)
    mutate(newStock, { onSuccess: () => setSaved(true) })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-3 text-sm text-destructive">Couldn't load this item.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to stock list
      </Link>

      <div className="flex gap-6">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-40 w-40 rounded object-cover"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p>Current stock: {product.stock}</p>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3 rounded-lg border p-4">
        <div className="space-y-1">
          <label htmlFor="stockCount" className="text-sm font-medium">
            Correct stock count
          </label>
          <Input
            id="stockCount"
            type="number"
            min={0}
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            placeholder={String(product.stock)}
            required
          />
        </div>

        {isSaveError && (
          <p role="alert" className="text-sm text-destructive">
            Couldn't save. Please try again.
          </p>
        )}
        {saved && !isPending && (
          <p role="status" className="text-sm text-green-600">
            Stock count updated.
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save correction'}
        </Button>
      </form>
    </div>
  )
}
