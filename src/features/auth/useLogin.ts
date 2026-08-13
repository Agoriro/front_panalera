import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { decodeJwt } from '../../lib/utils'
import { User } from '../../types/user'

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const decoded = decodeJwt(data.access_token)
      console.log('Decoded JWT payload on Login:', decoded)
      
      if (decoded) {
        let roleName = 'Vendedor' // Fallback role

        if (decoded.role) {
          const roleLower = decoded.role.toLowerCase()
          if (roleLower === 'admin') {
            roleName = 'Admin'
          } else if (roleLower === 'vendedor') {
            roleName = 'Vendedor'
          } else {
            roleName = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)
          }
        }

        const user: User = {
          id: decoded.sub || 'unknown',
          username: decoded.username || decoded.sub || 'Usuario',
          email: decoded.email || '',
          role: roleName,
          is_active: true,
        }
        
        login(user, data.access_token, data.refresh_token)
      }
    },
  })
}
