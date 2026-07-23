import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, Divider, Button } from '@mui/material'
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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Current Bill</Typography>

      <Divider sx={{ my: 2 }} />

      {cart.map((item) => (
        <CartItem key={item.id} item={item} onIncrease={() => increase(item.id!)} onDecrease={() => decrease(item.id!)} />
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5">Total : ₹{total}</Typography>

      <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={cart.length === 0} onClick={() => navigate(ROUTES.posPayment)}>
        Proceed To Payment
      </Button>
    </Paper>
  )
}
