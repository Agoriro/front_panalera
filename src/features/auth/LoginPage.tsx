import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from './authSchema'
import { useLogin } from './useLogin'
import { handleApiError } from '../../lib/utils'
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { ROUTES } from '../../router/routes'
import { isAxiosError } from 'axios'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [cooldown, setCooldown] = useState<number>(0)

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const onSubmit = (data: LoginInput) => {
    if (cooldown > 0) return

    loginMutation.mutate(data, {
      onSuccess: (response) => {
        // Redirection logic based on role
        // Since useLogin sets the role, we decode the role from the response token
        const token = response.access_token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const role = payload.role
          if (role === 'Admin') {
            navigate(ROUTES.DASHBOARD)
          } else {
            navigate(ROUTES.SALES)
          }
        } catch (e) {
          // Fallback
          navigate('/')
        }
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 429) {
          // Rate limit triggered
          setCooldown(60) // 60 seconds default cooldown
        } else {
          handleApiError(error)
        }
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-[#1A1A24] px-4 transition-colors duration-300">
      <Card className="w-full max-w-md border-border-soft dark:border-border-soft bg-surface-card dark:bg-card shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          {/* Logo container */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            {/* Cute Cradle SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M3 20c4-2 14-2 18 0" />
              <rect x="5" y="8" width="14" height="9" rx="1.5" />
              <path d="M8 8v9" />
              <path d="M12 8v9" />
              <path d="M16 8v9" />
              <path d="M5 8c0-3 3-4 6-4" />
            </svg>
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight text-text-base dark:text-white">
            Sistema Pañalera
          </CardTitle>
          <CardDescription className="text-text-muted dark:text-text-muted">
            Ingresa tus credenciales para acceder al sistema de gestión
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Cooldown Alert */}
            {cooldown > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-xs font-semibold text-danger border border-danger/20">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>
                  Demasiados intentos fallidos. Espera{' '}
                  <span className="font-mono text-sm">{cooldown}</span> segundos antes de
                  volver a intentar.
                </span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <User className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  className="pl-10"
                  disabled={loginMutation.isPending || cooldown > 0}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-danger font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={loginMutation.isPending || cooldown > 0}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-danger font-medium">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full font-display font-medium text-sm h-10 shadow-lg shadow-primary/10"
              disabled={loginMutation.isPending || cooldown > 0}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
