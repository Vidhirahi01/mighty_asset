// hooks/queries/useRequests.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryKeys } from '@/lib/queryKeys';
import {
    submitAssetRequest,
    CreateAssetRequestInput,
    SubmitAssetRequestResult,
    getManagerRequests,
    updateRequestStatus,
    RequestStatus,
    getRequestSummary,
    getApprovedAssetsForUser,
    getEmployeeOpenIssueCount,
    WorkflowRequestStatus,
    updateWorkflowRequestStatus,
    getOperationsAssignmentRequests,
    assignAssetToEmployee,
} from '@/services/request.service';

export function useSubmitAssetRequest() {
    const queryClient = useQueryClient();

    return useMutation<SubmitAssetRequestResult, Error, CreateAssetRequestInput>({
        mutationFn: submitAssetRequest,

        onSuccess: (result) => {

            queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });

            const { submittedCount, skippedCategories } = result;
            const word = submittedCount === 1 ? 'request' : 'requests';

            if (skippedCategories.length > 0) {
                Alert.alert(
                    'Partial Success',
                    `${submittedCount} ${word} submitted.\n\nSkipped (already pending): ${skippedCategories.join(', ')}`
                );
            } else {
                Alert.alert('Success', `${submittedCount} ${word} submitted successfully.`);
            }
        },

        onError: (error) => {
            if (error.message === 'ALREADY_PENDING_ALL') {
                Alert.alert('Already Submitted', 'Pending requests already exist for all selected categories.');
            } else {
                Alert.alert('Error', error.message || 'Failed to submit asset request.');
            }
        },
    });
}

export function useManagerRequests() {
    return useQuery({
        queryKey: queryKeys.requests.all,
        queryFn: getManagerRequests,
    });
}

export function useUpdateRequestStatus() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { requestId: string; status: RequestStatus }>({
        mutationFn: ({ requestId, status }) => updateRequestStatus(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update request status.');
        },
    });
}

export function useRequestSummary() {
    return useQuery({
        queryKey: ['requests', 'summary'],
        queryFn: getRequestSummary,
    });
}

export function useEmployeeAssignedAssets(userId?: string, email?: string) {
    const keyIdentity = userId || email || 'anonymous';

    return useQuery({
        queryKey: queryKeys.requests.employeeAssignedAssets(keyIdentity),
        queryFn: () => getApprovedAssetsForUser({ userId, email }),
        enabled: Boolean(userId || email),
    });
}

export function useEmployeeOpenIssueCount(userId?: string, email?: string) {
    const keyIdentity = userId || email || 'anonymous';

    return useQuery({
        queryKey: queryKeys.requests.employeeOpenIssues(keyIdentity),
        queryFn: () => getEmployeeOpenIssueCount({ userId, email }),
        enabled: Boolean(userId || email),
    });
}

export function useUpdateWorkflowRequestStatus() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { requestId: string; status: WorkflowRequestStatus }>({
        mutationFn: ({ requestId, status }) => updateWorkflowRequestStatus(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.operationsAssignmentQueue });
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update request status.');
        },
    });
}

export function useOperationsAssignmentRequests() {
    return useQuery({
        queryKey: queryKeys.requests.operationsAssignmentQueue,
        queryFn: getOperationsAssignmentRequests,
    });
}

export function useAssignAssetToEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignAssetToEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.operationsAssignmentQueue });
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.stats });
        },
        onError: (error: Error) => {
            Alert.alert('Error', error.message || 'Failed to complete assignment.');
        },
    });
}