// hooks/queries/useRequests.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryKeys } from '@/lib/queryKeys';
import { submitAssetRequest, CreateAssetRequestInput, SubmitAssetRequestResult } from '@/services/request.service';

export function useSubmitAssetRequest() {
    const queryClient = useQueryClient();

    return useMutation<SubmitAssetRequestResult, Error, CreateAssetRequestInput>({
        mutationFn: submitAssetRequest,

        onSuccess: (result) => {
            // Auto-refresh any screen that shows requests
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