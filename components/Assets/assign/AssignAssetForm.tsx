import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
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
import { AccessoryOption, AssetOption, AssetRequest, AssignPayload, AssignmentType } from './types';

type SelectOption = NonNullable<Option>;

type AssignAssetFormProps = {
    selectedRequest: AssetRequest | null;
    assets: AssetOption[];
    onAssign: (payload: AssignPayload) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
};

const assignmentOptions: Array<{ label: string; value: AssignmentType }> = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Project Based', value: 'project' },
];

const accessoryOptions: AccessoryOption[] = ['charger', 'plug', 'cable', 'bag', 'mouse', 'keyboard'];

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

export function AssignAssetForm({ selectedRequest, assets, onAssign, onCancel, isSubmitting = false }: AssignAssetFormProps) {
    const [selectedAsset, setSelectedAsset] = useState<SelectOption | undefined>(undefined);
    const [assignmentType, setAssignmentType] = useState<SelectOption | undefined>(undefined);
    const [assignDate, setAssignDate] = useState(new Date().toISOString().slice(0, 10));
    const [expectedReturn, setExpectedReturn] = useState('');
    const [assignNotes, setAssignNotes] = useState('');
    const [accessories, setAccessories] = useState<AccessoryOption[]>([]);

    const assetOptions: SelectOption[] = assets.map((asset) => ({
        label: `${asset.name} (${asset.modelNo}) [${asset.status === 'inRepair' ? 'in repair' : asset.status}]`,
        value: asset.id,
    }));

    const selectedAssetDetail = useMemo(
        () => assets.find((asset) => asset.id === selectedAsset?.value),
        [assets, selectedAsset]
    );

    const selectedAssetIsAvailable = selectedAssetDetail?.status === 'available';

    React.useEffect(() => {
        setSelectedAsset(undefined);
        setAssignmentType(undefined);
        setExpectedReturn('');
        setAssignNotes('');
        setAccessories([]);
        setAssignDate(new Date().toISOString().slice(0, 10));
    }, [selectedRequest?.id]);

    React.useEffect(() => {
        if (selectedAsset?.value && !assets.some((asset) => asset.id === selectedAsset.value)) {
            setSelectedAsset(undefined);
        }
    }, [assets, selectedAsset]);

    const toggleAccessory = (option: AccessoryOption) => {
        setAccessories((prev) =>
            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
        );
    };

    const submit = () => {
        if (!selectedRequest || !selectedAsset?.value || !assignmentType?.value) {
            return;
        }

        if (!selectedAssetIsAvailable) {
            return;
        }

        if (!isIsoDate(assignDate)) {
            return;
        }

        if (expectedReturn.trim() && !isIsoDate(expectedReturn)) {
            return;
        }

        const assignmentValue = assignmentType.value as AssignmentType;
        if ((assignmentValue === 'temporary' || assignmentValue === 'project') && !expectedReturn.trim()) {
            return;
        }

        onAssign({
            requestId: selectedRequest.id,
            assetId: selectedAsset.value,
            assignDate,
            assignmentType: assignmentValue,
            expectedReturn: expectedReturn.trim() ? expectedReturn.trim() : null,
            notes: assignNotes.trim(),
            accessories,
        });
    };

    const assignDisabled =
        isSubmitting ||
        !selectedRequest ||
        !selectedAsset?.value ||
        !selectedAssetIsAvailable ||
        !assignmentType?.value ||
        !isIsoDate(assignDate) ||
        (expectedReturn.trim() ? !isIsoDate(expectedReturn) : false) ||
        ((assignmentType?.value === 'temporary' || assignmentType?.value === 'project') && !expectedReturn.trim());

    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">Assign Asset</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
                {!selectedRequest ? (
                    <Text className="text-sm text-muted-foreground">Select a request from the list to start assignment.</Text>
                ) : (
                    <>
                        <View className="rounded-xl border border-border bg-background p-3">
                            <Text className="text-xs text-muted-foreground">Requester</Text>
                            <Text className="text-sm font-semibold text-foreground">{selectedRequest.requesterName} ({selectedRequest.employeeId})</Text>
                            <Text className="text-xs text-muted-foreground">{selectedRequest.department} | {selectedRequest.role}</Text>
                        </View>

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Select Asset</Text>
                            <View className="rounded-xl border border-border bg-background p-2">
                                <ScrollView className="max-h-56" nestedScrollEnabled={true}>
                                    <View className="gap-2">
                                        {assets.map((asset) => {
                                            const isAvailable = asset.status === 'available';
                                            const isSelected = selectedAsset?.value === asset.id;

                                            return (
                                                <Pressable
                                                    key={asset.id}
                                                    onPress={() => {
                                                        if (!isAvailable) return;
                                                        setSelectedAsset({ label: asset.name, value: asset.id });
                                                    }}
                                                    className={`rounded-lg border px-3 py-2 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'} ${!isAvailable ? 'opacity-50' : ''}`}
                                                >
                                                    <Text className="text-sm font-semibold text-foreground">
                                                        {asset.name}
                                                    </Text>
                                                    <Text className="text-xs text-muted-foreground">
                                                        {asset.modelNo} • {asset.category} • {asset.status}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                            {assetOptions.length === 0 ? (
                                <Text className="mt-2 text-xs text-muted-foreground">No available assets found for assignment right now.</Text>
                            ) : null}
                        </View>

                        {selectedAssetDetail && (
                            <View className="rounded-xl border border-border bg-background p-3">
                                <Text className="text-xs text-muted-foreground">Asset Details</Text>
                                <Text className="text-sm font-semibold text-foreground">{selectedAssetDetail.name}</Text>
                                <Text className="text-xs text-muted-foreground">Category: {selectedAssetDetail.category}</Text>
                                <Text className="text-xs text-muted-foreground">Model: {selectedAssetDetail.modelNo}</Text>
                                <Text className="text-xs text-muted-foreground">Serial: {selectedAssetDetail.serialNo}</Text>
                                <Text className="text-xs text-muted-foreground">Status: {selectedAssetDetail.status}</Text>
                                {!selectedAssetIsAvailable ? (
                                    <Text className="mt-1 text-xs text-amber-700">Only available assets can be assigned.</Text>
                                ) : null}
                            </View>
                        )}

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Assign Date</Text>
                            <TextInput
                                value={assignDate}
                                onChangeText={setAssignDate}
                                placeholder="YYYY-MM-DD"
                                className="rounded-xl border border-border px-3 py-2 text-foreground"
                            />
                            {!isIsoDate(assignDate) ? (
                                <Text className="mt-1 text-xs text-red-600">Enter date in YYYY-MM-DD format.</Text>
                            ) : null}
                        </View>

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Assignment Type</Text>
                            <Select value={assignmentType} onValueChange={setAssignmentType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                    <SelectGroup>
                                        <SelectLabel>Assignment Type</SelectLabel>
                                        {assignmentOptions.map((item) => (
                                            <SelectItem key={item.value} label={item.label} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </View>

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Expected Return (Optional)</Text>
                            <TextInput
                                value={expectedReturn}
                                onChangeText={setExpectedReturn}
                                placeholder="YYYY-MM-DD"
                                className="rounded-xl border border-border px-3 py-2 text-foreground"
                            />
                            {(assignmentType?.value === 'temporary' || assignmentType?.value === 'project') && !expectedReturn.trim() ? (
                                <Text className="mt-1 text-xs text-amber-700">Expected return date is required for temporary or project assignments.</Text>
                            ) : null}
                            {expectedReturn.trim() && !isIsoDate(expectedReturn) ? (
                                <Text className="mt-1 text-xs text-red-600">Enter date in YYYY-MM-DD format.</Text>
                            ) : null}
                        </View>

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Assign Notes</Text>
                            <TextInput
                                value={assignNotes}
                                onChangeText={setAssignNotes}
                                multiline
                                style={{ textAlignVertical: 'top' }}
                                placeholder="Add assignment notes"
                                className="h-24 rounded-xl border border-border px-3 py-2 text-foreground"
                            />
                        </View>

                        <View>
                            <Text className="mb-1 font-semibold text-foreground">Accessories</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {accessoryOptions.map((item) => {
                                    const selected = accessories.includes(item);
                                    return (
                                        <Pressable
                                            key={item}
                                            onPress={() => toggleAccessory(item)}
                                            className={`rounded-full border px-3 py-1.5 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
                                            <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
                                                {item}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mt-2 flex-row gap-3">
                            <Pressable onPress={onCancel} className="flex-1 items-center rounded-xl border border-border py-3">
                                <Text className="font-semibold text-foreground">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={submit}
                                disabled={assignDisabled}
                                className={`flex-1 items-center rounded-xl py-3 ${assignDisabled ? 'bg-primary/40' : 'bg-primary'}`}>
                                <Text className="font-semibold text-white">{isSubmitting ? 'Assigning...' : 'Assign'}</Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
