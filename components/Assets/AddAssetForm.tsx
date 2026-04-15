import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import ImagePickerExample from "@/components/Assets/uploadImage";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    type Option,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

type SelectOption = NonNullable<Option>;

type StockActionMode = 'add-stock' | 'update-stock-level' | 'set-reorder-alert';

type AddAssetFormProps = {
    onClose: () => void;
    presetAction?: StockActionMode;
};

export const AddAssetForm = ({ onClose, presetAction }: AddAssetFormProps) => {
    const [assetName, setAssetName] = useState("");
    const [category, setCategory] = useState<SelectOption | undefined>(undefined);
    const [brand, setBrand] = useState("");
    const [modelNo, setModelNo] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [condition, setCondition] = useState<SelectOption | undefined>(undefined);
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
    const [showPurchasePicker, setShowPurchasePicker] = useState(false);
    const [price, setPrice] = useState("");
    const [warrantyExpiry, setWarrantyExpiry] = useState<Date | null>(null);
    const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);
    const [notes, setNotes] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const assetIdRef = useRef(`AST-${Date.now().toString().slice(-6)}`);

    useEffect(() => {
        if (!presetAction) return;

        const presetNote =
            presetAction === 'add-stock'
                ? 'Inventory request: Add stock.'
                : presetAction === 'update-stock-level'
                    ? 'Inventory request: Update stock level.'
                    : 'Inventory request: Set reorder alert.';

        setNotes((current) => current || presetNote);
    }, [presetAction]);

    const addAsset = async () => {
        try {
            const { data, error } = await supabase
                .from("asset_table")
                .insert([
                    {
                        asset_name: assetName,
                        category: category?.value ?? null,
                        note: notes,
                        warranty_expiry: warrantyExpiry ? warrantyExpiry.toISOString().slice(0, 10) : null,
                        purchase_date: purchaseDate ? purchaseDate.toISOString().slice(0, 10) : null,
                        condition: condition?.value ?? null,
                        serial_no: serialNo || null,
                        model_no: modelNo || null,
                        brand,
                        status: null,
                        assigned_to: null,
                        image_url: imageUrl,
                    },
                ]);

            if (error) {
                console.log("Error:", error.message);
                return;
            }

            console.log("Inserted:", data);
            onClose();
        } catch (err) {
            console.log("Unexpected error:", err);
        }
    };

    const categories: SelectOption[] = [
        { label: "Laptops", value: "laptops" },
        { label: "Monitors", value: "monitors" },
        { label: "Keyboards", value: "keyboards" },
        { label: "Headphones", value: "headphones" },
        { label: "Accessories", value: "accessories" },
    ];

    const conditions: SelectOption[] = [
        { label: "New", value: "new" },
        { label: "Used", value: "used" },
        { label: "Good", value: "good" },
        { label: "Fair", value: "fair" },
        { label: "Refurbished", value: "refurbished" },
    ];

    return (
        <ScrollView showsVerticalScrollIndicator={false} scrollEnabled nestedScrollEnabled>
            <View className="flex-row items-center justify-between mb-5">
                <Text className="text-2xl font-bold text-foreground">Add Asset</Text>
                <Pressable onPress={onClose}>
                    <Text className="text-lg text-foreground">X</Text>
                </Pressable>
            </View>

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
                value={assetIdRef.current}
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
                <Pressable
                    onPress={() => setShowPurchasePicker(true)}
                    className="border-b border-border pb-2"
                >
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
                <Text className="mb-1 font-semibold text-foreground">Warranty Expiry</Text>
                <Pressable
                    onPress={() => setShowWarrantyPicker(true)}
                    className="border-b border-border pb-2"
                >
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

            <View className="flex-row items-center gap-3 mt-2">
                <Pressable onPress={onClose} className="flex-1 border border-border py-3.5 rounded-xl items-center">
                    <Text className="text-foreground font-semibold">Cancel</Text>
                </Pressable>
                <Pressable className="flex-1 bg-primary py-3.5 rounded-xl items-center" onPress={addAsset}>
                    <Text className="text-white font-semibold">Add Asset</Text>
                </Pressable>
            </View>
            <View className="h-24" />
        </ScrollView>
    );
};