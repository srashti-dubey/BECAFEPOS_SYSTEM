import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '@/auth/service'
import { useAuthStore } from '@/auth/store'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { ROUTES } from '@/constants/routes'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { createEmailField, createRequiredStringField } from '@/forms/utils'
import { notificationService } from '@/services/notificationService'
import styles from './LoginPage.module.css'

const loginSchema = z.object({
  email: createEmailField(),
  password: createRequiredStringField('Password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.pos

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // Wait for hydration before deciding — bouncing straight to the form and then immediately
  // away again (once the persisted session loads) would flash the login page unnecessarily.
  // Placed after every hook call (rules-of-hooks requires hooks to run unconditionally).
  if (isHydrated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(values: LoginFormValues) {
    try {
      await login(values)
      notificationService.success('Signed in successfully')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      notificationService.error(error instanceof Error ? error.message : 'Unable to sign in')
    }
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Use your account credentials to continue.</p>

        <FormProvider form={form} onSubmit={handleSubmit}>
          <FormField<LoginFormValues> name="email" label="Email" required>
            {(field) => <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />}
          </FormField>

          <FormField<LoginFormValues> name="password" label="Password" required>
            {(field) => (
              <div className={styles.passwordFieldWrapper}>
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="current-password" 
                  placeholder="********" 
                  {...field} 
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </FormField>

          <Button type="submit" fullWidth loading={form.formState.isSubmitting}>
            Sign in
          </Button>
        </FormProvider>

        <p className={styles.hint}>Demo credentials: admin@example.com / password123</p>
      </Card>
    </div>
  )
}
