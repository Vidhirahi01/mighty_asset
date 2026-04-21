import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, TextInput, View } from 'react-native';
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

const STATIC_ASSET_FALLBACK: AssignedAsset[] = [
    {
        id: 'demo-laptop-1',
        asset_name: 'Dell Latitude 5420',
        category: 'laptops',
        brand: 'Dell',
        model_no: '5420',
        serial_no: 'DL-5420-001',
        status: 'ASSIGNED',
    },
    {
        id: 'demo-monitor-1',
        asset_name: 'LG 24MP400',
        category: 'monitors',
        brand: 'LG',
        model_no: '24MP400',
        serial_no: 'LG-24-778',
        status: 'ASSIGNED',
    },
    {
        id: 'demo-keyboard-1',
        asset_name: 'Logitech K380',
        category: 'keyboards',
        brand: 'Logitech',
        model_no: 'K380',
        serial_no: 'KB-380-019',
        status: 'ASSIGNED',
    },
];

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

const ACCESSORY_ITEMS = ['Charger', 'Bag/Case', 'Mouse', 'Keyboard', 'Adapter/Dongle'];

export default function ReturnAssetScreen() {
    const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | number | null>(null);

    const [returnReason, setReturnReason] = useState<SelectOption | undefined>(undefined);
    const [assetCondition, setAssetCondition] = useState<SelectOption | undefined>(undefined);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const displayAssets = assignedAssets.length > 0 ? assignedAssets : STATIC_ASSET_FALLBACK;

    const selectedAsset = useMemo(
        () => displayAssets.find((asset) => String(asset.id) === String(selectedAssetId)),
        [displayAssets, selectedAssetId]
    );

    useEffect(() => {
        const loadAssignedAssets = async () => {
            setIsLoadingAssets(true);
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    Alert.alert('Error', authError.message || 'Unable to load current user.');
                    return;
                }

                const userId = authData.user?.id;
                const email = authData.user?.email;

                if (!userId && !email) {
                    setAssignedAssets([]);
                    return;
                }

                const candidates = [userId, email].filter(Boolean) as string[];
                const { data, error } = await supabase
                    .from('asset_table')
                    .select('id, asset_name, category, brand, model_no, serial_no, status')
                    .in('assigned_to', candidates)
                    .order('asset_name', { ascending: true });

                if (error) {
                    Alert.alert('Error', error.message || 'Failed to load assigned assets.');
                    return;
                }

                setAssignedAssets((data ?? []) as AssignedAsset[]);
            } finally {
                setIsLoadingAssets(false);
            }
        };

        loadAssignedAssets();
    }, []);

    const toggleAccessory = (name: string) => {
        setSelectedAccessories((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const resetForm = () => {
        setReturnReason(undefined);
        setAssetCondition(undefined);
        setAdditionalNotes('');
        setSelectedAccessories([]);
    };

    const handleSubmit = async () => {
        if (!selectedAsset) {
            Alert.alert('Select Asset', 'Please select an asset to return.');
            return;
        }

        if (!returnReason?.value || !assetCondition?.value) {
            Alert.alert('Missing Fields', 'Please select return reason and asset condition.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const requesterId = authData.user?.id ?? null;
            const requesterEmail = authData.user?.email ?? null;

            const summary = [
                `Asset ID: ${selectedAsset.id}`,
                `Reason: ${returnReason.label}`,
                `Condition: ${assetCondition.label}`,
                `Accessories Included: ${selectedAccessories.length ? selectedAccessories.join(', ') : 'None'}`,
                `Additional Notes: ${additionalNotes.trim() || 'None'}`,
            ].join('\n');

            const { error } = await supabase.from('request_table').insert([
                {
                    request_type: 'return-asset',
                    requester_id: requesterId,
                    requested_by: requesterEmail,
                    category: selectedAsset.category,
                    asset_type: selectedAsset.asset_name,
                    priority: 'medium',
                    reason: returnReason.label,
                    expected_duration: null,
                    additional_notes: summary,
                    status: 'PENDING',
                },
            ]);

            if (error) {
                Alert.alert('Error', error.message || 'Failed to submit return request.');
                return;
            }

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
                        <Text className="text-foreground/60 text-sm mt-1">Select your asset and submit a return request.</Text>
                    </View>

                    <Card className="bg-card mb-4">
                        <CardHeader>
                            <CardTitle className="text-foreground">Select Asset to Return</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingAssets ? (
                                <Text className="text-foreground/70">Loading assigned assets...</Text>
                            ) : (
                                <View className="gap-2">
                                    {displayAssets.map((asset) => {
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
                                                    {asset.serial_no ? ` | ${asset.serial_no}` : ''}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                            {!isLoadingAssets && assignedAssets.length === 0 ? (
                                <Text className="text-xs text-foreground/60 mt-2">
                                    Showing demo assets for now until account assignment data is available.
                                </Text>
                            ) : null}
                        </CardContent>
                    </Card>

                    {selectedAsset ? (
                        <Card className="bg-card mb-4">
                            <CardHeader>
                                <CardTitle className="text-foreground">Return Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <View className="gap-4">
                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Return Reason</Text>
                                        <Select value={returnReason} onValueChange={setReturnReason}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select return reason" />
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
                                                <SelectValue placeholder="Select asset condition" />
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

                                    <View>
                                        <Text className="mb-2 font-semibold text-foreground">Accessories Included</Text>
                                        <View className="gap-2">
                                            {ACCESSORY_ITEMS.map((item) => {
                                                const checked = selectedAccessories.includes(item);
                                                return (
                                                    <Pressable
                                                        key={item}
                                                        onPress={() => toggleAccessory(item)}
                                                        className={`flex-row items-center rounded-xl px-3 py-2 ${checked ? 'bg-primary/10' : 'bg-background'}`}
                                                    >
                                                        <View className={`mr-3 h-5 w-5 items-center justify-center rounded border ${checked ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
                                                            {checked ? <Text className="text-xs text-white">✓</Text> : null}
                                                        </View>
                                                        <Text className="text-foreground">{item}</Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Additional Notes</Text>
                                        <TextInput
                                            value={additionalNotes}
                                            onChangeText={setAdditionalNotes}
                                            placeholder="Any details about return condition or missing parts"
                                            multiline
                                            style={{ textAlignVertical: 'top' }}
                                            className="h-24 rounded-xl bg-accent p-3 text-foreground"
                                        />
                                    </View>

                                    <Card className="bg-accent/40">
                                        <CardContent className="pt-4">
                                            <Text className="font-semibold text-foreground mb-1">Return Instructions</Text>
                                            <Text className="text-sm text-foreground/80">1. Submit the form</Text>
                                            <Text className="text-sm text-foreground/80">2. Wait for approval</Text>
                                            <Text className="text-sm text-foreground/80">3. Bring asset to operational desk</Text>
                                            <Text className="text-sm text-foreground/80">4. Get return confirmation</Text>
                                        </CardContent>
                                    </Card>

                                    <View className="flex-row gap-3 mt-2">
                                        <Pressable
                                            onPress={resetForm}
                                            className="flex-1 items-center rounded-xl bg-accent py-3"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-foreground">Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit}
                                            className="flex-1 items-center rounded-xl bg-primary py-3"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-white">{isSubmitting ? 'Submitting...' : 'Submit Return'}</Text>
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
