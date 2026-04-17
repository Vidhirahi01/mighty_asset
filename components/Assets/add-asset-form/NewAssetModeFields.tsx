import React from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform, Pressable, TextInput, View } from "react-native";
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
import type { SelectOption } from "./formTypes";

type NewAssetModeFieldsProps = {
    assetName: string;
    setAssetName: (value: string) => void;
    category: SelectOption | undefined;
    setCategory: (value: SelectOption | undefined) => void;
    categories: SelectOption[];
    brand: string;
    setBrand: (value: string) => void;
    modelNo: string;
    setModelNo: (value: string) => void;
    serialNo: string;
    setSerialNo: (value: string) => void;
    assetId: string;
    condition: SelectOption | undefined;
    setCondition: (value: SelectOption | undefined) => void;
    conditions: SelectOption[];
    purchaseDate: Date | null;
    showPurchasePicker: boolean;
    setShowPurchasePicker: (value: boolean) => void;
    setPurchaseDate: (value: Date) => void;
    price: string;
    setPrice: (value: string) => void;
    quantity: number;
    setQuantity: (value: number) => void;
    warrantyExpiry: Date | null;
    showWarrantyPicker: boolean;
    setShowWarrantyPicker: (value: boolean) => void;
    setWarrantyExpiry: (value: Date) => void;
    notes: string;
    setNotes: (value: string) => void;
    setImageUrl: (value: string | null) => void;
};

export const NewAssetModeFields = ({
    assetName,
    setAssetName,
    category,
    setCategory,
    categories,
    brand,
    setBrand,
    modelNo,
    setModelNo,
    serialNo,
    setSerialNo,
    assetId,
    condition,
    setCondition,
    conditions,
    purchaseDate,
    showPurchasePicker,
    setShowPurchasePicker,
    setPurchaseDate,
    price,
    setPrice,
    quantity,
    setQuantity,
    warrantyExpiry,
    showWarrantyPicker,
    setShowWarrantyPicker,
    setWarrantyExpiry,
    notes,
    setNotes,
    setImageUrl,
}: NewAssetModeFieldsProps) => {
    return (
        <>
            <TextInput
                placeholder="Asset Name"
                value={assetName}
                onChangeText={setAssetName}
                className="text-lg font-semibold border-b border-border mb-4 pb-1 text-foreground"
            />

            <View className="mb-5">
                <Text className="mb-1 font-semibold text-foreground">Asset Category</Text>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                        <SelectGroup>
                            <SelectLabel>Asset Categories</SelectLabel>
                            {categories.map((item) => (
                                <SelectItem key={item.value} label={item.label} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </View>

            <TextInput
                placeholder="Brand/Manufacturer"
                value={brand}
                onChangeText={setBrand}
                className="text-base border-b border-border mb-4 pb-1 text-foreground"
            />

            <TextInput
                placeholder="Model No"
                value={modelNo}
                onChangeText={setModelNo}
                className="text-base border-b border-border mb-4 pb-1 text-foreground"
            />

            <TextInput
                placeholder="Serial No"
                value={serialNo}
                onChangeText={setSerialNo}
                className="text-base border-b border-border mb-4 pb-1 text-foreground"
            />

            <TextInput
                placeholder="Asset ID"
                value={assetId}
                editable={false}
                selectTextOnFocus={false}
                className="text-base border-b border-border mb-4 pb-1 text-foreground bg-accent"
            />

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

            <View className="mb-4">
                <Text className="mb-1 font-semibold text-foreground">Purchase Date</Text>
                <Pressable onPress={() => setShowPurchasePicker(true)} className="border-b border-border pb-2">
                    <Text className={purchaseDate ? "text-foreground" : "text-muted-foreground"}>
                        {purchaseDate ? purchaseDate.toISOString().slice(0, 10) : "Select date"}
                    </Text>
                </Pressable>
            </View>

            {showPurchasePicker && (
                <DateTimePicker
                    value={purchaseDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                        if (Platform.OS !== "ios") {
                            setShowPurchasePicker(false);
                        }

                        if (event.type === "set" && date) {
                            setPurchaseDate(date);
                        }
                    }}
                />
            )}

            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                className="text-base border-b border-border mb-4 pb-1 text-foreground"
            />

            <View className="mb-4">
                <NumberIncrementer label="Quantity" value={quantity} onChange={setQuantity} min={0} max={9999} step={1} />
            </View>

            <View className="mb-4">
                <Text className="mb-1 font-semibold text-foreground">Warranty Expiry</Text>
                <Pressable onPress={() => setShowWarrantyPicker(true)} className="border-b border-border pb-2">
                    <Text className={warrantyExpiry ? "text-foreground" : "text-muted-foreground"}>
                        {warrantyExpiry ? warrantyExpiry.toISOString().slice(0, 10) : "Select date"}
                    </Text>
                </Pressable>
            </View>

            {showWarrantyPicker && (
                <DateTimePicker
                    value={warrantyExpiry ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                        if (Platform.OS !== "ios") {
                            setShowWarrantyPicker(false);
                        }

                        if (event.type === "set" && date) {
                            setWarrantyExpiry(date);
                        }
                    }}
                />
            )}

            <TextInput
                placeholder="Specifications / Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={{ textAlignVertical: "top" }}
                className="h-36 bg-accent rounded-xl p-3 mb-5 text-foreground"
            />

            <ImagePickerExample onUploaded={setImageUrl} />
        </>
    );
};
