import { Paper, List, ListItemButton, ListItemText, Typography } from '@mui/material'

const categories = ['All', 'Beverages', 'Fast Food', 'Snacks']

export default function CategoryPanel() {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>

      <List>
        {categories.map((category) => (
          <ListItemButton key={category}>
            <ListItemText primary={category} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  )
}
