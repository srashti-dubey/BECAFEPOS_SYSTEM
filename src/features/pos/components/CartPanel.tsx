import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import CartItem, { type CartLineItem } from './CartItem'
import { cartService, onCartUpdated } from '../services/cartService'
import { getProduct } from '@/database/appDatabase'
import { ROUTES } from '@/constants/routes'

export default function CartPanel() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartLineItem[]>([])

  useEffect(() => {
    load()
    return onCartUpdated(load)
  }, [])

  async function load() {
    const items = await cartService.getCart()

    const result = await Promise.all(
      items.map(async (item) => {
        const product = await getProduct(item.productId)
        return { ...item, name: product?.name }
      }),
    )

    setCart(result)
  }

  async function increase(id: number) {
    await cartService.increase(id)
    load()
  }

  async function decrease(id: number) {
    await cartService.decrease(id)
    load()
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '100%', position: 'sticky', top: 72 }}
    >
      <Stack direction="row" sx={{ px: 2, pt: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Current Bill
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </Typography>
      </Stack>

      <Divider sx={{ mt: 1.5 }} />

      <Box sx={{ px: 2, flex: 1, maxHeight: 420, overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Cart is empty. Add items to start a bill.
          </Typography>
        ) : (
          cart.map((item, index) => (
            <Box key={item.id}>
              <CartItem item={item} onIncrease={() => increase(item.id!)} onDecrease={() => decrease(item.id!)} />
              {index < cart.length - 1 ? <Divider /> : null}
            </Box>
          ))
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ mb: 1.5, alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ₹{total}
          </Typography>
        </Stack>

        <Button fullWidth variant="contained" size="large" disabled={cart.length === 0} onClick={() => navigate(ROUTES.posPayment)}>
          Proceed to Payment
        </Button>
      </Box>
    </Paper>
  )
}
