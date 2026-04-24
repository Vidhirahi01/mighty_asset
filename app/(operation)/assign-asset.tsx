import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { AssignRequestList } from '@/components/Assets/assign/AssignRequestList';
import { AssignAssetForm } from '@/components/Assets/assign/AssignAssetForm';
import { AssetOption, AssetRequest, AssignPayload } from '@/components/Assets/assign/types';
import { useAssets } from '@/hooks/queries/useAssets';
import { useAssignAssetToEmployee, useOperationsAssignmentRequests } from '@/hooks/queries/useRequests';

const parsePriority = (reason: string | null): AssetRequest['priority'] => {
    const line = (reason ?? '').split('\n').find((item) => item.startsWith('Priority: '));
    const raw = line?.replace('Priority: ', '').trim().toLowerCase();
    if (raw === 'high') return 'high';
    if (raw === 'low') return 'low';
    return 'medium';
};

const parseRequestReason = (reason: string | null) => {
    const line = (reason ?? '').split('\n').find((item) => item.startsWith('Title: '));
    return line ? line.replace('Title: ', '').trim() : (reason || 'No reason provided');
};

const normalizeAssetOptionStatus = (status: string | null | undefined): AssetOption['status'] => {
    const normalized = String(status ?? '').toLowerCase().replace(/[_\s-]/g, '');
    if (normalized === 'available') return 'available';
    if (normalized === 'assigned' || normalized === 'inuse') return 'assigned';
    return 'inRepair';
};

export default function AssignAssetScreen() {
    const { data: queueRows = [], isLoading } = useOperationsAssignmentRequests();
    const { data: assetsData = [] } = useAssets();
    const assignAssetMutation = useAssignAssetToEmployee();

    const approvedRequests: AssetRequest[] = useMemo(() => {
        return queueRows
            .filter((row) => row.status === 'APPROVED')
            .map((row) => ({
                id: row.id,
                requestDate: row.created_at,
                priority: parsePriority(row.reason),
                requesterName:
                    row.requester_name ||
                    (row.email?.split('@')[0] || 'Employee').replace(/\./g, ' '),
                employeeId: row.user_id || row.email || 'N/A',
                department: row.department || 'Not specified',
                role: row.role || 'Employee',
                reason: parseRequestReason(row.reason),
                preferredCategory: row.category || 'uncategorized',
            }));
    }, [queueRows]);

    const purchaseQueue = useMemo(
        () => queueRows.filter((row) => row.status === 'PURCHASE_PENDING'),
        [queueRows]
    );

    const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);

    React.useEffect(() => {
        if (!selectedRequest && approvedRequests.length > 0) {
            setSelectedRequest(approvedRequests[0]);
            return;
        }

        if (selectedRequest && !approvedRequests.find((item) => item.id === selectedRequest.id)) {
            setSelectedRequest(approvedRequests[0] ?? null);
        }
    }, [approvedRequests, selectedRequest]);

    const assets: AssetOption[] = useMemo(
        () => assetsData.map((asset) => ({
            id: String(asset.id),
            name: asset.asset_name || 'Unnamed asset',
            category: asset.category || 'uncategorized',
            modelNo: asset.model_no || 'N/A',
            serialNo: (asset as { serial_no?: string | null }).serial_no || 'N/A',
            status: normalizeAssetOptionStatus(asset.status),
        })),
        [assetsData]
    );

    const filteredAssets = useMemo(() => {
        if (!selectedRequest) return assets;

        const preferred = selectedRequest.preferredCategory.toLowerCase();
        const preferredAssets = assets.filter(
            (asset) => asset.status === 'available' && asset.category.toLowerCase() === preferred
        );

        const otherAssets = assets.filter(
            (asset) => asset.status === 'available' && asset.category.toLowerCase() !== preferred
        );

        return [...preferredAssets, ...otherAssets];
    }, [assets, selectedRequest]);

    const handleAssign = (payload: AssignPayload) => {
        const sourceRequest = queueRows.find((row) => row.id === payload.requestId);
        if (!sourceRequest) {
            Alert.alert('Error', 'Request no longer available in assignment queue.');
            return;
        }

        assignAssetMutation.mutate(
            {
                requestId: payload.requestId,
                assetId: payload.assetId,
                assigneeUserId: sourceRequest.user_id,
                assigneeEmail: sourceRequest.email,
                assignDate: payload.assignDate,
                assignmentType: payload.assignmentType,
                expectedReturn: payload.expectedReturn,
                notes: payload.notes,
                accessories: payload.accessories,
            },
            {
                onSuccess: () => {
                    Alert.alert('Assigned', 'Asset has been assigned to employee successfully.');
                    setSelectedRequest(null);
                },
            }
        );
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
                <View className="mb-4">
                    <Text className="text-2xl font-bold text-foreground">Assign Asset</Text>
                    <Text className="text-sm text-muted-foreground">Operations assigns approved requests using actual inventory assets.</Text>
                </View>

                <View className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-3">
                    <Text className="text-xs font-bold uppercase tracking-wide text-sky-700">Purchase Queue</Text>
                    <Text className="mt-1 text-xs text-sky-700/80">
                        {purchaseQueue.length === 0
                            ? 'No requests are currently marked for purchase.'
                            : `${purchaseQueue.length} request${purchaseQueue.length > 1 ? 's' : ''} awaiting procurement.`}
                    </Text>
                </View>

                <View className="gap-4">
                    <View className="rounded-2xl border border-blue-200 bg-blue-50 p-3">
                        <Text className="text-xs font-bold uppercase tracking-wide text-blue-700">Approved Requests</Text>
                        <Text className="mb-3 mt-1 text-xs text-blue-700/80">
                            {isLoading ? 'Loading requests...' : 'Select one manager-approved request for assignment.'}
                        </Text>
                        <AssignRequestList
                            requests={approvedRequests}
                            selectedRequestId={selectedRequest?.id ?? null}
                            onSelectRequest={setSelectedRequest}
                        />
                    </View>

                    <View className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                        <Text className="text-xs font-bold uppercase tracking-wide text-emerald-700">Assign Asset Section</Text>
                        <Text className="mb-3 mt-1 text-xs text-emerald-700/80">
                            Pick inventory asset, assign to employee, and update stock in one step.
                        </Text>
                        <AssignAssetForm
                            selectedRequest={selectedRequest}
                            assets={filteredAssets}
                            onAssign={handleAssign}
                            onCancel={() => setSelectedRequest(null)}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
