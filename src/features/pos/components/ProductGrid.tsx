import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { loadProducts } from '../services/productService'
import ProductCard from './ProductCard'
import type { Product } from '@/database/appDatabase'

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts().then(setProducts)
  }, [])

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  )
}
