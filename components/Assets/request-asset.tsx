import React, { useEffect, useState } from 'react';
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
import { categories } from '@/components/Assets/add-asset-form/formTypes';
import { supabase } from '@/lib/supabase';

type SelectOption = NonNullable<Option>;

const PRIORITY_OPTIONS: SelectOption[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

const DURATION_OPTIONS: SelectOption[] = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Other', value: 'other' },
];

export default function RequestAssetScreen() {
    const [category, setCategory] = useState<SelectOption | undefined>(undefined);
    const [assetType, setAssetType] = useState<SelectOption | undefined>(undefined);
    const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [priority, setPriority] = useState<SelectOption | undefined>(undefined);
    const [expectedDuration, setExpectedDuration] = useState<SelectOption | undefined>(undefined);
    const [reason, setReason] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!category?.value) {
            setAssetOptions([]);
            setAssetType(undefined);
            return;
        }

        const loadAssetsByCategory = async () => {
            setIsLoadingAssets(true);
            const { data, error } = await supabase
                .from('asset_table')
                .select('asset_name')
                .eq('category', category.value);
            setIsLoadingAssets(false);

            if (error) {
                Alert.alert('Error', 'Failed to load asset list for selected category.');
                setAssetOptions([]);
                return;
            }

            const uniqueAssets = Array.from(
                new Set(
                    ((data ?? []) as Array<{ asset_name: string | null }>)
                        .map((item) => String(item.asset_name ?? '').trim())
                        .filter(Boolean)
                )
            );

            const options = uniqueAssets.map((name) => ({ label: name, value: name }));
            setAssetOptions(options);

            if (!options.some((item) => item.value === assetType?.value)) {
                setAssetType(undefined);
            }
        };

        loadAssetsByCategory();
    }, [category?.value]);

    const resetForm = () => {
        setCategory(undefined);
        setAssetType(undefined);
        setAssetOptions([]);
        setPriority(undefined);
        setExpectedDuration(undefined);
        setReason('');
        setAdditionalNotes('');
    };

    const handleSubmit = async () => {
        if (!category?.value || !assetType?.value || !priority?.value || !expectedDuration?.value || !reason.trim()) {
            Alert.alert('Missing Fields', 'Please fill category, asset type, priority, reason, and expected duration.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const requesterId = authData.user?.id ?? null;
            const requesterEmail = authData.user?.email ?? null;

            const { data: existingRequest, error: existingError } = await supabase
                .from('request_table')
                .select('id')
                .eq('requester_id', requesterId)
                .eq('category', category.value)
                .eq('asset_type', assetType.value)
                .in('status', ['Pending', 'pending'])
                .limit(1);

            if (existingError) {
                Alert.alert('Error', existingError.message || 'Failed to validate existing request.');
                return;
            }

            if (existingRequest && existingRequest.length > 0) {
                Alert.alert('Already Exists', 'A pending request for this asset type already exists.');
                return;
            }

            const { error: insertError } = await supabase
                .from('request_table')
                .insert([
                    {
                        request_type: 'asset-request',
                        requester_id: requesterId,
                        requested_by: requesterEmail,
                        category: category.value,
                        asset_type: assetType.value,
                        priority: priority.value,
                        reason: reason.trim(),
                        expected_duration: expectedDuration.value,
                        additional_notes: additionalNotes.trim() || null,
                        status: 'Pending',
                    },
                ]);

            if (insertError) {
                Alert.alert('Error', insertError.message || 'Failed to submit asset request.');
                return;
            }

            Alert.alert('Success', 'Asset request submitted successfully.');
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
                        <Text className="text-foreground text-2xl font-bold">Request Asset</Text>
                        <Text className="text-foreground/60 text-sm mt-1">Create a new asset request for approval.</Text>
                    </View>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Request Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="gap-4">
                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Asset Category</Text>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                            <SelectGroup>
                                                <SelectLabel>Categories</SelectLabel>
                                                {categories.map((item) => (
                                                    <SelectItem key={item.value} label={item.label} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Asset Type</Text>
                                    <Select value={assetType} onValueChange={setAssetType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={isLoadingAssets ? 'Loading assets...' : category ? 'Select asset type' : 'Select category first'} />
                                        </SelectTrigger>
                                        <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                            <SelectGroup>
                                                <SelectLabel>Asset Types</SelectLabel>
                                                {assetOptions.map((item) => (
                                                    <SelectItem key={item.value} label={item.label} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Priority</Text>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                            <SelectGroup>
                                                <SelectLabel>Priority</SelectLabel>
                                                {PRIORITY_OPTIONS.map((item) => (
                                                    <SelectItem key={item.value} label={item.label} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Reason for Request</Text>
                                    <TextInput
                                        placeholder="Why do you need this asset?"
                                        value={reason}
                                        onChangeText={setReason}
                                        multiline
                                        style={{ textAlignVertical: 'top' }}
                                        className="h-24 rounded-xl bg-accent p-3 text-foreground"
                                    />
                                </View>

                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Expected Duration</Text>
                                    <Select value={expectedDuration} onValueChange={setExpectedDuration}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                            <SelectGroup>
                                                <SelectLabel>Duration</SelectLabel>
                                                {DURATION_OPTIONS.map((item) => (
                                                    <SelectItem key={item.value} label={item.label} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View>
                                    <Text className="mb-1 font-semibold text-foreground">Additional Notes</Text>
                                    <TextInput
                                        placeholder="Any extra information"
                                        value={additionalNotes}
                                        onChangeText={setAdditionalNotes}
                                        multiline
                                        style={{ textAlignVertical: 'top' }}
                                        className="h-24 rounded-xl bg-accent p-3 text-foreground"
                                    />
                                </View>

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
                                        <Text className="font-semibold text-white">{isSubmitting ? 'Submitting...' : 'Submit Request'}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    <View style={{ height: 140 }} />
                </View>
            }
        />
    );
}
