
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchAllUsers, updateUser, createUser, deleteUser, CreateUserData } from '@/services/user.service';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    is_active: boolean;
    created_at: string;
}

export function useUsers() {
    return useQuery<User[]>({
        queryKey: queryKeys.users.all,
        queryFn: async () => {
            const data = await fetchAllUsers();
            return (data ?? []) as User[];
        },
    });
}
export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: Partial<CreateUserData> }) =>
            updateUser(userId, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: CreateUserData) => createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        // FIX: use lowercase 'string', NOT 'String'
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}