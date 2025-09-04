import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Menu } from '@/types'

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => apiClient.get<Menu[]>('/menus'),
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/menus', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    }
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/menus/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    }
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/menus/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    }
  })
}

export function useRoleMenus(roleId?: string) {
  return useQuery({
    queryKey: ['role-menus', roleId],
    queryFn: () => apiClient.get(`/role-menus${roleId ? `?roleId=${roleId}` : ''}`),
    enabled: !!roleId
  })
}

export function useAssignMenuToRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/role-menus', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menus'] })
    }
  })
}