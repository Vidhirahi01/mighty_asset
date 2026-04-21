export const queryKeys = {
    users: {
        byEmail: (email: string) => ['users', 'by-email', email] as const
    },
    request: {
        list: (userId: string) => ['requests', 'list', userId] as const,
        pendingByCategories: (userId: string, categories: string[]) =>
            ['requests', 'pending-by-categories', userId, [...categories].sort()] as const,
        managerInbox: (managerId: string) => ['requests', 'manager-inbox', managerId] as const,
    },
};