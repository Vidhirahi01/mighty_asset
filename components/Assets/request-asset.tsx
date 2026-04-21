import React, { useState } from 'react';
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

const QUANTITY_REQUIRED_CATEGORIES = new Set(['monitors', 'tablets', 'cables']);

export default function RequestAssetScreen() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categoryQuantities, setCategoryQuantities] = useState<Record<string, string>>({});
    const [priority, setPriority] = useState<SelectOption | undefined>(undefined);
    const [expectedDuration, setExpectedDuration] = useState<SelectOption | undefined>(undefined);
    const [reason, setReason] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCategoryLabel = (value: string) => {
        const match = categories.find((item) => item.value === value);
        return match?.label ?? value;
    };

    const toggleCategory = (value: string) => {
        setSelectedCategories((prev) => {
            const isSelected = prev.includes(value);
            if (isSelected) {
                setCategoryQuantities((current) => {
                    const next = { ...current };
                    delete next[value];
                    return next;
                });
                return prev.filter((item) => item !== value);
            }
            return [...prev, value];
        });
    };

    const setQuantityForCategory = (value: string, qty: string) => {
        const numericOnly = qty.replace(/[^0-9]/g, '');
        setCategoryQuantities((prev) => ({
            ...prev,
            [value]: numericOnly,
        }));
    };

    const resetForm = () => {
        setSelectedCategories([]);
        setCategoryQuantities({});
        setPriority(undefined);
        setExpectedDuration(undefined);
        setReason('');
        setAdditionalNotes('');
    };

    const handleSubmit = async () => {
        if (selectedCategories.length === 0 || !priority?.value || !expectedDuration?.value || !reason.trim()) {
            console.log("Status value:", status);
            Alert.alert('Missing Fields', 'Please select categories, priority, reason, and expected duration.');
            return;
        }

        const categoriesMissingQty = selectedCategories.filter((categoryValue) => {
            if (!QUANTITY_REQUIRED_CATEGORIES.has(categoryValue)) return false;
            const qty = Number(categoryQuantities[categoryValue] ?? '0');
            return !Number.isInteger(qty) || qty <= 0;
        });

        if (categoriesMissingQty.length > 0) {
            Alert.alert('Missing Quantity', 'Please enter a valid quantity for monitors, tablets, and cables.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const requesterEmail = authData.user?.email ?? null;

            if (!requesterEmail) {
                Alert.alert('Error', 'Unable to determine current user email.');
                return;
            }

            const { data: userRow, error: userError } = await supabase
                .from('user_table')
                .select('id')
                .eq('email', requesterEmail)
                .single();

            if (userError || !userRow?.id) {
                Alert.alert('Error', userError?.message || 'Unable to map email to user profile.');
                return;
            }

            const { data: existingRows, error: existingError } = await supabase
                .from('request_table')
                .select('category')
                .eq('user_id', userRow.id)
                .eq('type', 'ASSET_REQUEST')
                .eq('status', 'PENDING')
                .in('category', selectedCategories);

            if (existingError) {
                console.log("status:", status)
                Alert.alert('Error', existingError.message || 'Failed to validate existing requests.');
                return;
            }

            const alreadyPendingCategories = new Set(
                ((existingRows ?? []) as Array<{ category: string | null }>)
                    .map((row) => row.category)
                    .filter((rowCategory): rowCategory is string => Boolean(rowCategory))
            );

            const categoriesToInsert = selectedCategories.filter((categoryValue) => !alreadyPendingCategories.has(categoryValue));

            if (categoriesToInsert.length === 0) {
                Alert.alert('Already Exists', 'Pending requests already exist for all selected categories.');
                return;
            }

            const requests = categoriesToInsert.map((categoryValue) => {
                const quantity = QUANTITY_REQUIRED_CATEGORIES.has(categoryValue)
                    ? Number(categoryQuantities[categoryValue])
                    : 1;

                const detailLines = [
                    `Title: ${reason.trim()}`,
                    `Priority: ${priority.label}`,
                    `Expected Duration: ${expectedDuration.label}`,
                    `Additional Notes: ${additionalNotes.trim() || 'None'}`,
                ];

                return {
                    email: requesterEmail,
                    asset_id: null,
                    type: 'ASSET_REQUEST',
                    status: 'PENDING',
                    reason: detailLines.join('\n'),
                    approved_by: null,
                    user_id: userRow.id,
                    category: categoryValue,
                    brand: null,
                    model_no: null,
                    quantity,
                };
            });

            const { error: insertError } = await supabase
                .from('request_table')
                .insert(requests);

            if (insertError) {
             
                Alert.alert('Error', insertError.message || 'Failed to submit asset request.');
                return;
            }

            if (alreadyPendingCategories.size > 0) {
                Alert.alert(
                    'Partial Success',
                    `${requests.length} request${requests.length > 1 ? 's' : ''} submitted. Skipped existing pending categories: ${Array.from(alreadyPendingCategories).join(', ')}`
                );
            } else {
                Alert.alert('Success', `${requests.length} request${requests.length > 1 ? 's' : ''} submitted successfully.`);
            }
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
                                    <Text className="mb-2 font-semibold text-foreground">Asset Categories</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {categories.map((item) => {
                                            const selected = selectedCategories.includes(item.value);
                                            return (
                                                <Pressable
                                                    key={item.value}
                                                    onPress={() => toggleCategory(item.value)}
                                                    className={`rounded-full border px-3 py-2 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
                                                    <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
                                                        {item.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                    <Text className="mt-2 text-xs text-foreground/60">You can select multiple categories.</Text>
                                </View>

                                {selectedCategories.some((categoryValue) => QUANTITY_REQUIRED_CATEGORIES.has(categoryValue)) ? (
                                    <View>
                                        <Text className="mb-2 font-semibold text-foreground">Quantity (required for monitors, tablets, cables)</Text>
                                        <View className="gap-3">
                                            {selectedCategories
                                                .filter((categoryValue) => QUANTITY_REQUIRED_CATEGORIES.has(categoryValue))
                                                .map((categoryValue) => (
                                                    <View key={categoryValue}>
                                                        <Text className="mb-1 text-sm text-foreground">{getCategoryLabel(categoryValue)}</Text>
                                                        <TextInput
                                                            value={categoryQuantities[categoryValue] ?? ''}
                                                            onChangeText={(text) => setQuantityForCategory(categoryValue, text)}
                                                            keyboardType="number-pad"
                                                            placeholder="Enter quantity"
                                                            className="rounded-xl bg-accent p-3 text-foreground"
                                                        />
                                                    </View>
                                                ))}
                                        </View>
                                    </View>
                                ) : null}

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
