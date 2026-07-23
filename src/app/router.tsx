import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { AuthApp } from '@/app/AuthApp'
import { routes } from '@/app/routes'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AuthApp />,
    children: [
      {
        path: '/',
        element: <App />,
        children: routes,
      },
    ],
  },
])
