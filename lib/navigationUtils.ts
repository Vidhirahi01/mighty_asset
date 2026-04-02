/**
 * Gets the appropriate navigation route based on user role
 * @param role - User's role (ADMIN, MANAGER, TECHNICIAN, EMPLOYEE, etc.)
 * @returns Navigation path for the role
 */
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
        default:
            return "/(tabs)/";
    }
};
   
/**
 * Gets the appropriate navigation route based on user role and department
 * @param role - User's role
 * @param department - User's department
 * @returns Navigation path for the role/department combination
 */
export const getRoleBasedRouteWithDepartment = (
    role: string | undefined,
    department: string | undefined
): string => {
    // For now, using standard role-based routing
    // Can be extended to handle department-specific screens
    return getRoleBasedRoute(role);
};