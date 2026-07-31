import { createTheme } from '@mui/material/styles'

// Bridges MUI (used only by the hand-built POS module) into this app's real design system
// instead of Material Design's default blue. Values are the light-mode hex equivalents of
// index.css's CSS custom properties (--accent, --danger, ...) — MUI's createTheme computes
// light/dark tints and contrast text via actual color math (decomposeColor), so it can't take
// an opaque var() reference the way plain CSS/sx color props can; only literal colors work here.
// This does mean the POS module's MUI chrome stays light-themed even under prefers-color-scheme
// dark, unlike the rest of the app (which is pure CSS vars and adapts automatically).
export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#6d28d9',
      dark: '#5b21b6',
      contrastText: '#fff',
    },
    error: {
      main: '#dc2626',
      dark: '#b91c1c',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#d97706',
    },
    background: {
      default: '#f8f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#08060d',
      secondary: '#4b5563',
    },
    divider: '#e5e4e7',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'var(--sans)',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'var(--border)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})
