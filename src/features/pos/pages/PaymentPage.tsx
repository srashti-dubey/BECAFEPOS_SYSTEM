import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'
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

function roundUpTo(value: number, step: number) {
  return Math.ceil(value / step) * step
}

// Quick-amount shortcuts for a cashier to tap instead of typing — exact change plus the next
// couple of round note denominations above the total, deduped (e.g. total ₹150 -> 150/200/500).
function cashPresets(total: number) {
  if (total <= 0) return []
  const values = [total, roundUpTo(total, 50), roundUpTo(total, 100), roundUpTo(total, 500)]
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

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
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
        Payment
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: '12px', p: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Amount due
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ₹{total}
          </Typography>
        </Stack>

        <TextField
          sx={{ mt: 3 }}
          fullWidth
          label="Cash received"
          type="number"
          value={received || ''}
          onChange={(e) => setReceived(Number(e.target.value))}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {cashPresets(total).map((amount) => (
            <Chip
              key={amount}
              label={amount === total ? `Exact · ₹${amount}` : `₹${amount}`}
              onClick={() => setReceived(amount)}
              color={received === amount ? 'primary' : 'default'}
              variant={received === amount ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider', alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Change
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color={change < 0 ? 'error' : 'success.main'}>
            ₹{change}
          </Typography>
        </Stack>

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={!canConfirm} onClick={confirmPayment}>
          Confirm Payment
        </Button>
      </Paper>
    </Box>
  )
}
