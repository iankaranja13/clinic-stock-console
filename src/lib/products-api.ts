import { api } from './api'

export interface Product {
  id: number
  title: string
  category: string
  price: number
  stock: number
  thumbnail: string
  brand?: string
  description: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface Category {
  slug: string
  name: string
}

export interface FetchProductsParams {
  search: string
  category: string
  sortBy: string
  order: 'asc' | 'desc'
  page: number
  limit: number
}

// DummyJSON has no endpoint for "search within a category," so the two
// filters can't be combined server-side. When both are set, search
// takes precedence over the category filter.
export async function fetchProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const { search, category, sortBy, order, page, limit } = params
  const skip = (page - 1) * limit
  const commonParams = { limit: String(limit), skip: String(skip), sortBy, order }

  if (search) {
    const response = await api.get<ProductsResponse>('/products/search', {
      params: { q: search, ...commonParams },
    })
    return response.data
  }

  if (category) {
    const response = await api.get<ProductsResponse>(`/products/category/${category}`, {
      params: commonParams,
    })
    return response.data
  }

  const response = await api.get<ProductsResponse>('/products', { params: commonParams })
  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/products/categories')
  return response.data
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

export async function updateProductStock(id: string, stock: number): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, { stock })
  return response.data
}
