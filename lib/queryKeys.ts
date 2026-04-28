export const queryKeys = {
 
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
        employeeAssetRequests: (identity: string) => ['requests', 'employee-asset-requests', identity] as const,
        employeeOpenIssues: (identity: string) => ['requests', 'employee-open-issues', identity] as const,
        operationsAssignmentQueue: ['requests', 'operations-assignment-queue'] as const,
        pendingByCategories: (userId: string, categories: string[]) =>
            ['requests', 'pending-by-categories', userId, [...categories].sort()] as const,
        managerInbox: (managerId: string) => ['requests', 'manager-inbox', managerId] as const,
        all: ['requests', 'all'] as const,
    },

    issues: {
        all: ['issues', 'all'] as const,
        operations: ['issues', 'operations'] as const,
        technicians: ['issues', 'technicians'] as const,
        byTechnician: (technicianId: string) => ['issues', 'technician', technicianId] as const,
        employee: (userId: string) => ['issues', 'employee', userId] as const,
        openCount: (userId: string) => ['issues', 'open-count', userId] as const,
    },
};