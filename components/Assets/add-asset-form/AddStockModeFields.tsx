import React from "react";
import { TextInput, View } from "react-native";
import ImagePickerExample from "@/components/Assets/uploadImage";
import NumberIncrementer from "@/components/ui/numberIncrementer";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { AssetRecord, SelectOption } from "./formTypes";

type AddStockModeFieldsProps = {
    selectedLowStockAsset: SelectOption | undefined;
    setSelectedLowStockAsset: (value: SelectOption | undefined) => void;
    isLoadingLowStockAssets: boolean;
    lowStockAssetOptions: SelectOption[];
    selectedAssetRecord: AssetRecord | undefined;
    quantity: number;
    setQuantity: (value: number) => void;
    condition: SelectOption | undefined;
    setCondition: (value: SelectOption | undefined) => void;
    conditions: SelectOption[];
    notes: string;
    setNotes: (value: string) => void;
    setImageUrl: (value: string | null) => void;
    getThresholdForAsset: (asset: AssetRecord) => number;
    getStockStatus: (qty: number, minLevel: number) => string;
};

export const AddStockModeFields = ({
    selectedLowStockAsset,
    setSelectedLowStockAsset,
    isLoadingLowStockAssets,
    lowStockAssetOptions,
    selectedAssetRecord,
    quantity,
    setQuantity,
    condition,
    setCondition,
    conditions,
    notes,
    setNotes,
    setImageUrl,
    getThresholdForAsset,
    getStockStatus,
}: AddStockModeFieldsProps) => {
    return (
        <>
            <View className="mb-5">
                <Text className="mb-1 font-semibold text-foreground">Low Stock Asset</Text>
                <Select value={selectedLowStockAsset} onValueChange={setSelectedLowStockAsset}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingLowStockAssets ? "Loading low-stock assets..." : "Select an asset"} />
                    </SelectTrigger>
                    <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                        <SelectGroup>
                            <SelectLabel>Low Stock Assets</SelectLabel>
                            {lowStockAssetOptions.map((item) => (
                                <SelectItem key={item.value} label={item.label} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </View>

            {selectedAssetRecord && (
                <View className="mb-4 rounded-xl border border-border bg-accent p-3">
                    {(() => {
                        const selectedQty = Number(selectedAssetRecord.quantity ?? 0);
                        const selectedMin = getThresholdForAsset(selectedAssetRecord);
                        const selectedStatus = getStockStatus(selectedQty, selectedMin);
                        const selectedStatusLabel = selectedStatus === "out-of-stock" ? "Out of Stock" : selectedStatus === "low-stock" ? "Low Stock" : "In Stock";
                        return (
                            <>
                                <Text className="text-sm font-semibold text-foreground">Current Quantity: {selectedAssetRecord.quantity ?? 0}</Text>
                                <Text className="mt-1 text-xs text-foreground/60">Minimum Threshold: {selectedMin}</Text>
                                <Text className="mt-1 text-xs text-foreground/60">Status: {selectedStatusLabel}</Text>
                            </>
                        );
                    })()}
                </View>
            )}

            <View className="mb-4">
                <NumberIncrementer
                    label="Refill Quantity"
                    value={quantity}
                    onChange={setQuantity}
                    min={0}
                    max={9999}
                    step={1}
                />
            </View>

            <View className="mb-5">
                <Text className="mb-1 font-semibold text-foreground">Condition</Text>
                <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                        <SelectGroup>
                            <SelectLabel>Condition</SelectLabel>
                            {conditions.map((item) => (
                                <SelectItem key={item.value} label={item.label} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </View>

            <TextInput
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={{ textAlignVertical: "top" }}
                className="h-28 bg-accent rounded-xl p-3 mb-5 text-foreground"
            />

            <Text className="mb-2 text-xs text-foreground/60">Update image only if needed. Otherwise existing image will remain.</Text>
            <ImagePickerExample onUploaded={setImageUrl} />
        </>
    );
};