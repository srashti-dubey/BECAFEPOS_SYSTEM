import { Card, CardContent, CardMedia, Typography, Button, Stack } from '@mui/material'
import type { Product } from '@/database/appDatabase'
import { cartService } from '../services/cartService'
import { notificationService } from '@/services/notificationService'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  async function handleAdd() {
    await cartService.add(product.id, product.price)
    notificationService.success(`${product.name} added to cart`)
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      }}
    >
      <CardMedia component="img" image={product.image} height="110" sx={{ objectFit: 'cover' }} />

      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap title={product.name}>
          {product.name}
        </Typography>

        <Stack direction="row" sx={{ mt: 0.75, mb: 1.25, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ₹{product.price}
          </Typography>
        </Stack>

        <Button fullWidth variant="contained" size="small" onClick={handleAdd}>
          + Add
        </Button>
      </CardContent>
    </Card>
  )
}
