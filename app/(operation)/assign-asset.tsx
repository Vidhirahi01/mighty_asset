import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { AssignRequestList } from '@/components/Assets/assign/AssignRequestList';
import { AssignAssetForm } from '@/components/Assets/assign/AssignAssetForm';
import { AssetOption, AssetRequest, AssignPayload } from '@/components/Assets/assign/types';

const REQUESTS: AssetRequest[] = [
    {
        id: 'REQ-1001',
        requestDate: '2026-04-15',
        priority: 'high',
        requesterName: 'Arjun Mehta',
        employeeId: 'EMP-119',
        department: 'Engineering',
        role: 'Frontend Developer',
        reason: 'New project onboarding requires laptop and accessories.',
        preferredCategory: 'laptops',
    },
    {
        id: 'REQ-1002',
        requestDate: '2026-04-14',
        priority: 'medium',
        requesterName: 'Nisha Patel',
        employeeId: 'EMP-204',
        department: 'Operations',
        role: 'Analyst',
        reason: 'Monitor replacement request due to hardware flicker.',
        preferredCategory: 'monitors',
    },
    {
        id: 'REQ-1003',
        requestDate: '2026-04-13',
        priority: 'low',
        requesterName: 'Rahul Verma',
        employeeId: 'EMP-231',
        department: 'Support',
        role: 'Technician',
        reason: 'Temporary keyboard request for project room workstation.',
        preferredCategory: 'keyboards',
    },
];

const ASSETS: AssetOption[] = [
    { id: 'AST-001', name: 'Dell Latitude', category: 'laptops', modelNo: '7440', serialNo: 'DL7440-A11', status: 'available' },
    { id: 'AST-002', name: 'HP Elitebook', category: 'laptops', modelNo: '840 G9', serialNo: 'HP840-B21', status: 'available' },
    { id: 'AST-003', name: 'LG 27 Monitor', category: 'monitors', modelNo: '27UP850', serialNo: 'LG27-D12', status: 'available' },
    { id: 'AST-004', name: 'MX Keys', category: 'keyboards', modelNo: 'MX Keys', serialNo: 'MXK-E99', status: 'available' },
    { id: 'AST-005', name: 'Docking Station', category: 'accessories', modelNo: 'USB-C Dock', serialNo: 'DK-110', status: 'assigned' },
];

export default function AssignAssetScreen() {
    const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(REQUESTS[0] ?? null);

    const filteredAssets = useMemo(() => {
        if (!selectedRequest) return ASSETS;

        const preferred = selectedRequest.preferredCategory.toLowerCase();
        const preferredAssets = ASSETS.filter(
            (asset) => asset.status === 'available' && asset.category.toLowerCase() === preferred
        );

        const otherAssets = ASSETS.filter(
            (asset) => asset.status === 'available' && asset.category.toLowerCase() !== preferred
        );

        return [...preferredAssets, ...otherAssets];
    }, [selectedRequest]);

    const handleAssign = (payload: AssignPayload) => {
        Alert.alert(
            'Assignment Submitted',
            `Request ${payload.requestId} submitted to manager for approval.`
        );
        console.log('Assign payload:', payload);
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
                <View className="mb-4">
                    <Text className="text-2xl font-bold text-foreground">Assign Asset</Text>
                    <Text className="text-sm text-muted-foreground">Handle incoming requests and submit assignment approval to manager.</Text>
                </View>

                <View className="gap-4">
                    <View className="rounded-2xl border border-blue-200 bg-blue-50 p-3">
                        <Text className="text-xs font-bold uppercase tracking-wide text-blue-700">Incoming Requests Section</Text>
                        <Text className="mb-3 mt-1 text-xs text-blue-700/80">Select one request to start assignment.</Text>
                        <AssignRequestList
                            requests={REQUESTS}
                            selectedRequestId={selectedRequest?.id ?? null}
                            onSelectRequest={setSelectedRequest}
                        />
                    </View>

                    <View className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                        <Text className="text-xs font-bold uppercase tracking-wide text-emerald-700">Assign Asset Section</Text>
                        <Text className="mb-3 mt-1 text-xs text-emerald-700/80">Fill assignment details and send approval to manager.</Text>
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
