import { useEffect } from 'react'
import { Grid } from '@mui/material'
import CategoryPanel from '../components/CategoryPanel'
import ProductGrid from '../components/ProductGrid'
import CartPanel from '../components/CartPanel'
import { syncPendingOrders } from '../services/syncService'

export default function POSPage() {
  useEffect(() => {
    syncPendingOrders()

    window.addEventListener('online', syncPendingOrders)
    return () => window.removeEventListener('online', syncPendingOrders)
  }, [])

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={{ xs: 12, md: 2 }}>
        <CategoryPanel />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <ProductGrid />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <CartPanel />
      </Grid>
    </Grid>
  )
}
