import { useAuthStore } from '@/store/auth-store'
import { ApiResponse } from './api-response'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      // Try to get token from Zustand persist storage first
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      
      if (authStorage) {
        try {
          const parsedAuth = JSON.parse(authStorage)
          token = parsedAuth.state?.accessToken
        } catch (e) {
          // Fallback to direct localStorage access
          token = localStorage.getItem('accessToken')
        }
      }
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    const response = await fetch(url, config)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Request failed')
    }

    // Return the data from the standardized API response
    if (result.status === 'success') {
      return result.data !== undefined ? result.data : result
    }
    
    // For non-standardized responses, return as is
    return result
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()