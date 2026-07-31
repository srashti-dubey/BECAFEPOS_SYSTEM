import { Box, IconButton, Stack, Typography } from '@mui/material'
import type { CartItem as CartItemRecord } from '@/database/appDatabase'

export type CartLineItem = CartItemRecord & { name?: string }

interface Props {
  item: CartLineItem
  onIncrease: () => void
  onDecrease: () => void
}

const stepperButtonSx = {
  width: 26,
  height: 26,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '6px',
  fontSize: 16,
  lineHeight: 1,
}

export default function CartItem({ item, onIncrease, onDecrease }: Props) {
  return (
    <Stack direction="row" sx={{ py: 1, alignItems: 'center' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={item.name}>
          {item.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          ₹{item.price} × {item.qty}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.75} sx={{ mr: 1.5, alignItems: 'center' }}>
        <IconButton size="small" sx={stepperButtonSx} onClick={onDecrease} aria-label={`Decrease ${item.name ?? 'item'}`}>
          −
        </IconButton>
        <Typography variant="body2" sx={{ minWidth: 16, textAlign: 'center', fontWeight: 600 }}>
          {item.qty}
        </Typography>
        <IconButton size="small" sx={stepperButtonSx} onClick={onIncrease} aria-label={`Increase ${item.name ?? 'item'}`}>
          +
        </IconButton>
      </Stack>

      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 56, textAlign: 'right' }}>
        ₹{item.price * item.qty}
      </Typography>
    </Stack>
  )
}
