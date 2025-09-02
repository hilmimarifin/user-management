import { useAuthStore } from '@/store/auth-store'

class ApiClient {
  private baseURL = '/api'

  private async request(endpoint: string, options: RequestInit = {}) {
    const { accessToken } = useAuthStore.getState()
    
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      // Try to refresh token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        useAuthStore.getState().setAuth(data.user, data.accessToken)
        
        // Retry original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${data.accessToken}`
        }
        return fetch(url, config)
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        throw new Error('Authentication failed')
      }
    }

    return response
  }

  async get(endpoint: string) {
    const response = await this.request(endpoint)
    return response.json()
  }

  async post(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  async put(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  async delete(endpoint: string) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    })
    return response.json()
  }
}

export const apiClient = new ApiClient()