import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, TextField, Button } from '@mui/material'
import { saveOrder } from '../services/orderService'
import { cartService } from '../services/cartService'
import { notificationService } from '@/services/notificationService'
import { ROUTES } from '@/constants/routes'

export default function PaymentPage() {
  const navigate = useNavigate()
  const [total, setTotal] = useState(0)
  const [received, setReceived] = useState(0)

  useEffect(() => {
    cartService.getCart().then((cart) => {
      setTotal(cart.reduce((sum, item) => sum + item.price * item.qty, 0))
    })
  }, [])

  async function confirmPayment() {
    const cart = await cartService.getCart()

    await saveOrder({
      orderNo: Date.now().toString(),
      total,
      items: cart,
    })

    await cartService.clear()
    notificationService.success('Order saved')
    navigate(ROUTES.pos)
  }

  const change = received - total
  const canConfirm = total > 0 && received >= total

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Payment</Typography>

      <Typography sx={{ mt: 3 }}>Total ₹ {total}</Typography>

      <TextField
        sx={{ mt: 3 }}
        fullWidth
        label="Cash Received"
        type="number"
        value={received || ''}
        onChange={(e) => setReceived(Number(e.target.value))}
      />

      <Typography sx={{ mt: 2 }} color={change < 0 ? 'error' : undefined}>
        Change ₹ {change}
      </Typography>

      <Button fullWidth variant="contained" sx={{ mt: 3 }} disabled={!canConfirm} onClick={confirmPayment}>
        Confirm Payment
      </Button>
    </Paper>
  )
}
