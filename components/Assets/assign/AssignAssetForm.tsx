import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
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
};

const assignmentOptions: Array<{ label: string; value: AssignmentType }> = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Project Based', value: 'project' },
];

const accessoryOptions: AccessoryOption[] = ['charger', 'plug', 'cable', 'bag', 'mouse', 'keyboard'];

export function AssignAssetForm({ selectedRequest, assets, onAssign, onCancel }: AssignAssetFormProps) {
    const [selectedAsset, setSelectedAsset] = useState<SelectOption | undefined>(undefined);
    const [assignmentType, setAssignmentType] = useState<SelectOption | undefined>(undefined);
    const [assignDate, setAssignDate] = useState(new Date().toISOString().slice(0, 10));
    const [expectedReturn, setExpectedReturn] = useState('');
    const [assignNotes, setAssignNotes] = useState('');
    const [accessories, setAccessories] = useState<AccessoryOption[]>([]);

    const availableAssets = useMemo(
        () => assets.filter((asset) => asset.status === 'available'),
        [assets]
    );

    const assetOptions: SelectOption[] = availableAssets.map((asset) => ({
        label: `${asset.name} (${asset.modelNo})`,
        value: asset.id,
    }));

    const selectedAssetDetail = useMemo(
        () => availableAssets.find((asset) => asset.id === selectedAsset?.value),
        [availableAssets, selectedAsset]
    );

    const toggleAccessory = (option: AccessoryOption) => {
        setAccessories((prev) =>
            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
        );
    };

    const submit = () => {
        if (!selectedRequest || !selectedAsset?.value || !assignmentType?.value) {
            return;
        }

        onAssign({
            requestId: selectedRequest.id,
            assetId: selectedAsset.value,
            assignDate,
            assignmentType: assignmentType.value as AssignmentType,
            expectedReturn: expectedReturn.trim() ? expectedReturn.trim() : null,
            notes: assignNotes.trim(),
            accessories,
        });
    };

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
                            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose an available asset" />
                                </SelectTrigger>
                                <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                    <SelectGroup>
                                        <SelectLabel>Available Assets</SelectLabel>
                                        {assetOptions.map((asset) => (
                                            <SelectItem key={asset.value} label={asset.label} value={asset.value}>
                                                {asset.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </View>

                        {selectedAssetDetail && (
                            <View className="rounded-xl border border-border bg-background p-3">
                                <Text className="text-xs text-muted-foreground">Asset Details</Text>
                                <Text className="text-sm font-semibold text-foreground">{selectedAssetDetail.name}</Text>
                                <Text className="text-xs text-muted-foreground">Category: {selectedAssetDetail.category}</Text>
                                <Text className="text-xs text-muted-foreground">Model: {selectedAssetDetail.modelNo}</Text>
                                <Text className="text-xs text-muted-foreground">Serial: {selectedAssetDetail.serialNo}</Text>
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
                                disabled={!selectedAsset?.value || !assignmentType?.value}
                                className={`flex-1 items-center rounded-xl py-3 ${!selectedAsset?.value || !assignmentType?.value ? 'bg-primary/40' : 'bg-primary'}`}>
                                <Text className="font-semibold text-white">Assign</Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
