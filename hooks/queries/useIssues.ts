import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryKeys } from '@/lib/queryKeys';
import {
    assignIssueTechnician,
    getIssueTechnicians,
    getIssuesByReporter,
    getIssuesForOperations,
    getIssuesForTechnician,
    IssueWorkflowStatus,
    saveRepairProgress,
    updateIssueStatus,
} from '@/services/issue.service';

export function useOperationsIssues() {
    return useQuery({
        queryKey: queryKeys.issues.operations,
        queryFn: getIssuesForOperations,
    });
}

export function useIssueTechnicians() {
    return useQuery({
        queryKey: queryKeys.issues.technicians,
        queryFn: getIssueTechnicians,
    });
}

export function useTechnicianIssues(technicianId?: string | null) {
    const techId = technicianId?.trim() || '';

    return useQuery({
        queryKey: queryKeys.issues.byTechnician(techId || 'anonymous'),
        queryFn: () => getIssuesForTechnician(techId),
        enabled: Boolean(techId),
    });
}

export function useEmployeeIssues(reportedBy?: string | null) {
    const userId = reportedBy?.trim() || '';

    return useQuery({
        queryKey: queryKeys.issues.employee(userId || 'anonymous'),
        queryFn: () => getIssuesByReporter(userId),
        enabled: Boolean(userId),
    });
}

export function useUpdateIssueStatus() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { issueId: string; status: IssueWorkflowStatus }>({
        mutationFn: ({ issueId, status }) => updateIssueStatus(issueId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.operations });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
            queryClient.invalidateQueries({ queryKey: ['issues', 'employee'] });
            queryClient.invalidateQueries({ queryKey: ['issues', 'open-count'] });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update issue status.');
        },
    });
}

export function useAssignIssueTechnician() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { issueId: string; technicianId: string; technicianName: string; assignedById?: string | null; activate?: boolean }>({
        mutationFn: ({ issueId, technicianId, technicianName, assignedById, activate }) =>
            assignIssueTechnician({ issueId, technicianId, technicianName, assignedById, activate }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.operations });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
            queryClient.invalidateQueries({ queryKey: ['issues', 'employee'] });
            queryClient.invalidateQueries({ queryKey: ['issues', 'technician'] });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to assign technician.');
        },
    });
}

export function useSaveRepairProgress() {
    const queryClient = useQueryClient();

    return useMutation<
        { id: string },
        Error,
        { assetId: string; technicianId: string; status: string; notes: string }
    >({
        mutationFn: saveRepairProgress,
        onSuccess: (_data, variables) => {
            const techId = variables?.technicianId?.trim() || '';
            if (techId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.issues.byTechnician(techId) });
            }
            // also refresh operations / all issues so other views update
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.operations });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to save repair progress.');
        },
    });
}
