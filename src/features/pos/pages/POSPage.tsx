import { useEffect } from 'react'
import { Box, Grid, Stack, Typography } from '@mui/material'
import CategoryPanel from '../components/CategoryPanel'
import ProductGrid from '../components/ProductGrid'
import CartPanel from '../components/CartPanel'
import SyncStatus from '../components/SyncStatus'
import { syncPendingOrders } from '../services/syncService'

export default function POSPage() {
  useEffect(() => {
    syncPendingOrders()

    window.addEventListener('online', syncPendingOrders)
    return () => window.removeEventListener('online', syncPendingOrders)
  }, [])

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <Stack direction="row" sx={{ mb: 2.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Point of Sale
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Pick items to build the current bill.
          </Typography>
        </Box>
        <SyncStatus />
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 2.5 }}>
          <CategoryPanel />
        </Grid>

        <Grid size={{ xs: 12, md: 6.5 }}>
          <ProductGrid />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CartPanel />
        </Grid>
      </Grid>
    </Box>
  )
}
