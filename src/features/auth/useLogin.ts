import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { decodeJwt } from '../../lib/utils'
import { User } from '../../types/auth'

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data, credentials) => {
      const decoded = decodeJwt(data.access_token)
      
      if (decoded) {
        let roleName = 'Consulta'

        if (decoded.role) {
          const roleLower = decoded.role.toLowerCase()
          if (roleLower === 'admin') {
            roleName = 'Admin'
          } else if (roleLower === 'operator') {
            roleName = 'Operator'
          } else if (roleLower === 'consulta') {
            roleName = 'Consulta'
          } else {
            roleName = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)
          }
        }

        const user: User = {
          id: decoded.sub || 'unknown',
          username: decoded.username || credentials.username || 'Usuario',
          email: decoded.email || '',
          role: roleName,
          is_active: true,
        }
        
        login(user, data.access_token, data.refresh_token)
      }
    },
  })
}
