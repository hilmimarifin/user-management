import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { apiClient } from '@/lib/api'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
    }
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
    }
  })
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    },
    onSuccess: () => {
      logout()
    }
  })
}

export function useUserMenus() {
  return useQuery({
    queryKey: ['user-menus'],
    queryFn: () => apiClient.get('/menus?forUser=true'),
  })
}