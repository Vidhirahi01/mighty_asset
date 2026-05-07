import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    type Option,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeAssignedAssets } from '@/hooks/queries/useRequests';
import { useReturnRequests } from '@/hooks/queries/useReturnRequests';

type SelectOption = NonNullable<Option>;

type AssignedAsset = {
    id: string | number;
    asset_name: string | null;
    category: string | null;
    brand: string | null;
    model_no: string | null;
    serial_no: string | null;
    status: string | null;
};



const RETURN_REASONS: SelectOption[] = [
    { label: 'No Longer Needed', value: 'no-longer-needed' },
    { label: 'Role Change', value: 'role-change' },
    { label: 'Replacement Requested', value: 'replacement-requested' },
    { label: 'Damaged Asset', value: 'damaged-asset' },
    { label: 'Other', value: 'other' },
];

const ASSET_CONDITIONS: SelectOption[] = [
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Damaged', value: 'damaged' },
];

export default function ReturnAssetScreen() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const { data: assignedRows = [], isLoading: isLoadingAssets } = useEmployeeAssignedAssets(user?.id, user?.email);
    const [selectedAssetId, setSelectedAssetId] = useState<string | number | null>(null);

    const [returnReason, setReturnReason] = useState<SelectOption | undefined>(undefined);
    const [assetCondition, setAssetCondition] = useState<SelectOption | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignedAssets = useMemo(
        () => assignedRows
            .filter((item) => Boolean(item.assetId))
            .map((item) => ({
                id: item.assetId as string,
                asset_type: item.assetName as string,
                asset_name: item.assetName,
                category: item.category,
                brand: item.brand,
                model_no: item.modelNo,
                serial_no: null,
                status: 'ASSIGNED',
            })),
        [assignedRows]
    );

    const selectedAsset = useMemo(
        () => assignedAssets.find((asset) => String(asset.id) === String(selectedAssetId)),
        [assignedAssets, selectedAssetId]
    );

    useEffect(() => {
        if (!selectedAssetId && assignedAssets.length > 0) {
            setSelectedAssetId(assignedAssets[0].id);
            return;
        }

        if (selectedAssetId && !assignedAssets.some((asset) => String(asset.id) === String(selectedAssetId))) {
            setSelectedAssetId(assignedAssets[0]?.id ?? null);
        }
    }, [assignedAssets, selectedAssetId]);

    const resetForm = () => {
        setReturnReason(undefined);
        setAssetCondition(undefined);
    };

    const handleSubmit = async () => {
        if (!selectedAsset) {
            Alert.alert('Select Asset', 'Please select an asset to return.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const requesterId = authData.user?.id ?? null;
            const requesterEmail = authData.user?.email ?? null;

            const summary = [
                `Asset ID: ${selectedAsset.id}`,
                `Reason: ${returnReason?.label ?? 'Not specified'}`,
                `Condition: ${assetCondition?.label ?? 'Not specified'}`,
            ].join('\n');

            const payload = {
                type: 'return-asset',
                user_id: requesterId,
                email: requesterEmail,
                asset_id: selectedAsset.id,
                category: selectedAsset.category ?? null,
                brand: selectedAsset.brand ?? null,
                model_no: selectedAsset.model_no ?? null,
                quantity: 1,
                reason: summary,
                status: 'PENDING',
            };

            const { data: createdRequest, error } = await supabase
                .from('request_table')
                .insert([payload])
                .select('id')
                .single();
            if (error) {
                Alert.alert('Error', error.message || 'Failed to submit return request.');
                return;
            }

            const { notifyRoles } = await import('@/services/notification.service');
            await notifyRoles(['MANAGER', 'OPERATION'], {
                type: 'return_requested',
                title: 'Return Requested',
                body: `${requesterEmail ?? 'Employee'} requested an asset return.`,
                requestId: createdRequest?.id ? String(createdRequest.id) : undefined,
            }).catch(() => { });

            const { error: updateError } = await supabase
                .from('request_table')
                .update({ status: 'RETURN_PENDING' })
                .eq('asset_id', selectedAsset.id)
                .eq('status', 'APPROVED')
                .eq('type', 'ASSET_REQUEST');

            if (updateError) {
                console.warn('Could not mark assignment as return pending:', updateError.message);
            }

            queryClient.invalidateQueries({ queryKey: ['requests', 'employee-assigned-assets'] });
            queryClient.invalidateQueries({ queryKey: ['requests', 'employee-asset-requests'] });

            if (requesterId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.requests.list(requesterId) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });

            Alert.alert('Return Submitted', 'Your return request has been submitted.');
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FlatList
            data={[]}
            keyExtractor={(_, index) => String(index)}
            renderItem={null}
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListHeaderComponent={
                <View className="p-6">
                    <View className="mb-4">
                        <Text className="text-foreground text-2xl font-bold">Return Asset</Text>
                        <Text className="text-foreground/60 text-sm mt-1">Select the asset you want to return and provide details.</Text>
                    </View>

                    <Card className="bg-card mb-4">
                        <CardHeader>
                            <CardTitle className="text-foreground">Assigned Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingAssets ? (
                                <Text className="text-foreground/70">Loading assigned assets...</Text>
                            ) : (
                                <View className="gap-2">
                                    {assignedAssets.map((asset) => {
                                        const isSelected = String(selectedAssetId) === String(asset.id);
                                        return (
                                            <Pressable
                                                key={String(asset.id)}
                                                onPress={() => setSelectedAssetId(asset.id)}
                                                className={`rounded-xl px-3 py-3 ${isSelected ? 'bg-primary/10' : 'bg-background'}`}
                                            >
                                                <Text className="font-semibold text-foreground">{asset.asset_name || 'Unnamed Asset'}</Text>
                                                <Text className="text-xs text-foreground/70 mt-1">
                                                    {asset.category || 'Uncategorized'}
                                                    {asset.model_no ? ` | ${asset.model_no}` : ''}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                            {!isLoadingAssets && assignedAssets.length === 0 ? (
                                <Text className="text-xs text-foreground/60 mt-2">
                                    No assigned assets found. Assets appear here only after operations completes assignment.
                                </Text>
                            ) : null}
                        </CardContent>
                    </Card>

                    {selectedAsset ? (
                        <Card className="bg-card mb-4">
                            <CardHeader>
                                <CardTitle className="text-foreground">Issue Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <View className="gap-4">
                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Return Reason</Text>
                                        <Select value={returnReason} onValueChange={setReturnReason}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>
                                            <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                                <SelectGroup>
                                                    <SelectLabel>Return Reasons</SelectLabel>
                                                    {RETURN_REASONS.map((item) => (
                                                        <SelectItem key={item.value} label={item.label} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Asset Condition</Text>
                                        <Select value={assetCondition} onValueChange={setAssetCondition}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                                <SelectGroup>
                                                    <SelectLabel>Condition</SelectLabel>
                                                    {ASSET_CONDITIONS.map((item) => (
                                                        <SelectItem key={item.value} label={item.label} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View className="flex-row gap-3 mt-2">
                                        <Pressable
                                            onPress={resetForm}
                                            className="flex-1 items-center rounded-xl bg-accent py-3 px-4"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-foreground">Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit}
                                            className="flex-1 items-center rounded-xl bg-primary py-3 px-4"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-white">{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </CardContent>
                        </Card>
                    ) : null}

                    <View style={{ height: 140 }} />
                </View>
            }
        />
    );
}
