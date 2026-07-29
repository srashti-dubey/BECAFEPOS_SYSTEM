import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, TextField, Button } from '@mui/material'
import { saveOrder } from '../services/orderService'
import { savePayment } from '../services/paymentService'
import { cartService } from '../services/cartService'
import { syncPendingOrders, syncPendingPayments } from '../services/syncService'
import { useAuthStore } from '@/auth/store'
import { notificationService } from '@/services/notificationService'
import { ROUTES } from '@/constants/routes'

// Cash is the only payment mode this checkout flow supports today — hardcoded until a payment
// mode selector exists in the UI.
const CASH_PAYMENT_MODE_ID = 1

export default function PaymentPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [total, setTotal] = useState(0)
  const [received, setReceived] = useState(0)

  useEffect(() => {
    cartService.getCart().then((cart) => {
      setTotal(cart.reduce((sum, item) => sum + item.price * item.qty, 0))
    })

    function runSync() {
      void syncPendingOrders()
      void syncPendingPayments()
    }

    runSync()
    window.addEventListener('online', runSync)
    return () => window.removeEventListener('online', runSync)
  }, [])

  async function confirmPayment() {
    const cart = await cartService.getCart()
    const orderNo = Date.now().toString()

    await saveOrder({
      orderNo,
      total,
      items: cart,
    })

    await savePayment({
      PaymentModeID: CASH_PAYMENT_MODE_ID,
      AmountPaid: received,
      Ack_Received: true,
      Cashier_UserID: user?.id ?? '',
      SGSTValue: 0,
      CGSTValue: 0,
      OrderID: orderNo,
      CreatedDate: new Date().toISOString(),
      CreatedBy: user?.id ?? '',
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
