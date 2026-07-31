import { Paper, Stack, Typography } from '@mui/material'

const categories = ['All', 'Beverages', 'Fast Food', 'Snacks']

export default function CategoryPanel() {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: '12px' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
        Categories
      </Typography>

      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {categories.map((category, index) => {
          const active = index === 0
          return (
            <Paper
              key={category}
              elevation={0}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: active ? 700 : 500,
                color: active ? 'primary.contrastText' : 'text.primary',
                bgcolor: active ? 'primary.main' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                transition: 'background-color 0.15s, color 0.15s',
                '&:hover': {
                  bgcolor: active ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {category}
            </Paper>
          )
        })}
      </Stack>
    </Paper>
  )
}
