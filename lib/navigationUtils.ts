export const getRoleBasedRoute = (role: string | undefined): string => {
    if (!role) return "/(tabs)/";

    switch (role.toUpperCase()) {
        case 'ADMIN':
            return "/(admin)/dashboard";
        case 'MANAGER':
            return "/(manager)/dashboard";
        case 'TECHNICIAN':
            return "/(technician)/dashboard";
        case 'EMPLOYEE':
            return "/(employee)/dashboard";
        case 'OPERATION':
            return "/(operation)/dashboard";
        default:
            return "/(tabs)/";
    }
};

export const getRoleBasedRouteWithDepartment = (
    role: string | undefined,
    department: string | undefined
): string => {
    return getRoleBasedRoute(role);
};