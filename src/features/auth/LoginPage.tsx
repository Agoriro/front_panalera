import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from './authSchema'
import { useLogin } from './useLogin'
import { handleApiError } from '../../lib/utils'
import { Lock, User, AlertCircle, Loader2, Package } from 'lucide-react'
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
          } else if (role === 'Operator') navigate(ROUTES.SALES)
          else navigate(ROUTES.INVENTORY)
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
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-[#5b0672] p-12 text-white lg:flex">
        <div className="flex items-center gap-3 font-display text-lg font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e2cef6] text-[#5b0672]">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          Pañalera Pro
        </div>
        <div className="max-w-xl">
          <p className="font-display text-4xl font-bold leading-tight tracking-[-0.035em]">Control comercial claro. Decisiones con datos confiables.</p>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">Inventario, compras, ventas y reportes en un espacio seguro para la operación diaria.</p>
        </div>
        <p className="text-xs text-white/45">Gestión interna empresarial</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
      <Card className="w-full max-w-[440px] border-border bg-card shadow-[0_20px_60px_rgb(23_32_51/0.10)]">
        <CardHeader className="space-y-3 px-6 pt-7 text-left sm:px-8">
          {/* Logo container */}
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-[-0.025em] text-foreground">
            Sistema Pañalera
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema de gestión
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 px-6 sm:px-8">
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
          <CardFooter className="border-0 bg-transparent px-6 pb-7 pt-2 sm:px-8">
            <Button
              type="submit"
              className="h-11 w-full font-display text-sm"
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
      </section>
    </div>
  )
}

export default LoginPage
