import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryKeys } from '@/lib/queryKeys';
import {
    assignIssueTechnician,
    getIssueTechnicians,
    getIssuesByReporter,
    getIssuesForOperations,
    IssueWorkflowStatus,
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

    return useMutation<void, Error, { issueId: string; technicianName: string; activate?: boolean }>({
        mutationFn: ({ issueId, technicianName, activate }) =>
            assignIssueTechnician({ issueId, technicianName, activate }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.operations });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
            queryClient.invalidateQueries({ queryKey: ['issues', 'employee'] });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to assign technician.');
        },
    });
}
