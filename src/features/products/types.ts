export type ProductVariant = {
  size: string
  price: number
}

export type Product = {
  id: string
  productName: string
  category: 'Hot' | 'Cold'
  variants: ProductVariant[]
  description: string
  isOrganic: boolean
  roastLevel: string
  dietaryTags: string[]
  sweetness: number
  sku: string
}
