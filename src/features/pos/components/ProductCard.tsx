import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material'
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
    <Card>
      <CardMedia component="img" image={product.image} height="120" />

      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography>₹{product.price}</Typography>

        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>
          Add
        </Button>
      </CardContent>
    </Card>
  )
}
