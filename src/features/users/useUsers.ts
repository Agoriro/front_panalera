import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi, USER_KEYS } from '../../api/users'
import { getRolesApi, ROLE_KEYS } from '../../api/roles'
import { UserFormInput } from '../../types/user'

export const useUsers = () => {
  const queryClient = useQueryClient()

  // Users Query
  const usersQuery = useQuery({
    queryKey: USER_KEYS.all,
    queryFn: getUsersApi,
  })

  // Roles Query
  const rolesQuery = useQuery({
    queryKey: ROLE_KEYS.all,
    queryFn: getRolesApi,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserFormInput }) =>
      updateUserApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    roles: rolesQuery.data || [],
    isLoadingRoles: rolesQuery.isLoading,
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
export default useUsers
