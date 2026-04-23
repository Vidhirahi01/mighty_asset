export const queryKeys = {
    // Users
    users: {
        all: ['users', 'all'] as const,
        byEmail: (email: string) => ['users', 'by-email', email] as const,
        byId: (id: string) => ['users', 'by-id', id] as const,
    },

    assets: {
        all: ['assets', 'all'] as const,
        byCategory: (category: string) => ['assets', 'by-category', category] as const,
        stats: ['assets', 'stats'] as const,
    },

    requests: {
        list: (userId: string) => ['requests', 'list', userId] as const,
        employeeAssignedAssets: (identity: string) => ['requests', 'employee-assigned-assets', identity] as const,
        employeeOpenIssues: (identity: string) => ['requests', 'employee-open-issues', identity] as const,
        pendingByCategories: (userId: string, categories: string[]) =>
            ['requests', 'pending-by-categories', userId, [...categories].sort()] as const,
        managerInbox: (managerId: string) => ['requests', 'manager-inbox', managerId] as const,
        all: ['requests', 'all'] as const,
    },
};