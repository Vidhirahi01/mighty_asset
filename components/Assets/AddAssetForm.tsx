import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, TextInput, View, Alert } from "react-native";
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
import NumberIncrementer from "@/components/ui/numberIncrementer";
import { supabase } from "@/lib/supabase";

type SelectOption = NonNullable<Option>;

type StockActionMode = 'add-stock' | 'set-reorder-alert';

const CATEGORY_MIN_STOCK_LEVEL: Record<string, number> = {
    laptops: 2,
    monitors: 3,
    keyboards: 10,
    headphones: 5,
    cables: 30,
    accessories: 20,
};

const DEFAULT_MIN_STOCK_LEVEL = 5;

type AddAssetFormProps = {
    onClose: () => void;
    presetAction?: StockActionMode;
};

type AssetRecord = {
    id: string | number;
    asset_name: string;
    category: string | null;
    quantity: number | null;
    minimum_stock_level: number | null;
    status: string | null;
    condition: string | null;
    image_url: string | null;
    note: string | null;
};

const getThresholdForAsset = (asset: AssetRecord) => {
    if (typeof asset.minimum_stock_level === 'number' && asset.minimum_stock_level > 0) {
        return asset.minimum_stock_level;
    }
    if (asset.category && CATEGORY_MIN_STOCK_LEVEL[asset.category]) {
        return CATEGORY_MIN_STOCK_LEVEL[asset.category];
    }
    return DEFAULT_MIN_STOCK_LEVEL;
};

export const AddAssetForm = ({ onClose, presetAction }: AddAssetFormProps) => {
    const isAddStockMode = presetAction === 'add-stock';

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
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [lowStockAssets, setLowStockAssets] = useState<AssetRecord[]>([]);
    const [selectedLowStockAsset, setSelectedLowStockAsset] = useState<SelectOption | undefined>(undefined);
    const [isLoadingLowStockAssets, setIsLoadingLowStockAssets] = useState(false);
    const assetIdRef = useRef(`AST-${Date.now().toString().slice(-6)}`);

    const numericQuantity = quantity;
    const numericMinimumStockLevel = category?.value
        ? (CATEGORY_MIN_STOCK_LEVEL[category.value] ?? DEFAULT_MIN_STOCK_LEVEL)
        : DEFAULT_MIN_STOCK_LEVEL;

    const getStockStatus = (qty: number, minLevel: number) => {
        if (qty <= 0) return 'out-of-stock';
        if (qty <= minLevel) return 'low-stock';
        return 'in-stock';
    };

    const stockStatus = getStockStatus(numericQuantity, numericMinimumStockLevel);

    const selectedAssetRecord = lowStockAssets.find(
        (asset) => String(asset.id) === selectedLowStockAsset?.value
    );

    useEffect(() => {
        if (!isAddStockMode) return;

        const loadLowStockAssets = async () => {
            setIsLoadingLowStockAssets(true);
            const { data, error } = await supabase
                .from('asset_table')
                .select('id, asset_name, category, quantity, minimum_stock_level, status, condition, image_url, note');

            setIsLoadingLowStockAssets(false);

            if (error) {
                Alert.alert('Error', 'Failed to load low stock assets.');
                return;
            }

            const assets = (data ?? []) as AssetRecord[];
            const filteredLowStockAssets = assets.filter((asset) => {
                const qty = Number(asset.quantity ?? 0);
                const minLevel = getThresholdForAsset(asset);
                const computedStatus = getStockStatus(qty, minLevel);
                return computedStatus !== 'in-stock';
            });

            setLowStockAssets(filteredLowStockAssets);
        };

        loadLowStockAssets();
    }, [isAddStockMode]);

    useEffect(() => {
        if (!selectedAssetRecord?.condition) return;

        setCondition((current) => {
            if (current?.value) return current;
            return {
                label: String(selectedAssetRecord.condition),
                value: String(selectedAssetRecord.condition),
            };
        });
    }, [selectedAssetRecord]);

    useEffect(() => {
        if (!presetAction) return;

        const presetNote =
            presetAction === 'add-stock'
                ? 'Inventory request: Add stock.'
                : 'Inventory request: Set reorder alert.';

        setNotes((current) => current || presetNote);
    }, [presetAction]);

    const addAsset = async () => {
        if (quantity < 0) {
            Alert.alert('Invalid Quantity', 'Quantity cannot be negative.');
            return;
        }

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
                        quantity: numericQuantity,
                        minimum_stock_level: numericMinimumStockLevel,
                        status: stockStatus,
                        assigned_to: null,
                        image_url: imageUrl,
                    },
                ]);

            if (error) {
                console.log("Error:", error.message);
                return;
            }

            console.log("Inserted:", data);

            if (stockStatus !== 'in-stock') {
                const alertMessage = stockStatus === 'out-of-stock'
                    ? 'Asset was saved with Out of Stock status. Please restock immediately.'
                    : 'Asset was saved with Low Stock status. Reorder alert should be triggered.';
                Alert.alert('Stock Alert', alertMessage);
            }

            onClose();
        } catch (err) {
            console.log("Unexpected error:", err);
        }
    };

    const refillExistingAssetStock = async () => {
        if (!selectedAssetRecord) {
            Alert.alert('Select Asset', 'Please select a low-stock asset to refill.');
            return;
        }

        if (!condition?.value) {
            Alert.alert('Missing Condition', 'Please select condition.');
            return;
        }

        const currentQuantity = Number(selectedAssetRecord.quantity ?? 0);
        const minLevel = Number(selectedAssetRecord.minimum_stock_level ?? DEFAULT_MIN_STOCK_LEVEL);
        const updatedQuantity = currentQuantity + Math.max(0, quantity);
        const updatedStatus = getStockStatus(updatedQuantity, minLevel);

        const { error } = await supabase
            .from('asset_table')
            .update({
                quantity: updatedQuantity,
                status: updatedStatus,
                condition: condition.value,
                image_url: imageUrl ?? selectedAssetRecord.image_url,
                note: notes || selectedAssetRecord.note,
            })
            .eq('id', selectedAssetRecord.id);

        if (error) {
            Alert.alert('Error', 'Failed to update stock.');
            return;
        }

        Alert.alert('Stock Updated', `${selectedAssetRecord.asset_name} quantity updated to ${updatedQuantity}.`);
        onClose();
    };

    const categories: SelectOption[] = [
        { label: "Laptops", value: "laptops" },
        { label: "Monitors", value: "monitors" },
        { label: "Keyboards", value: "keyboards" },
        { label: "Headphones", value: "headphones" },
        { label: "Cables", value: "cables" },
        { label: "Accessories", value: "accessories" },
    ];

    const conditions: SelectOption[] = [
        { label: "New", value: "new" },
        { label: "Used", value: "used" },
        { label: "Good", value: "good" },
        { label: "Fair", value: "fair" },
        { label: "Refurbished", value: "refurbished" },
    ];

    const lowStockAssetOptions: SelectOption[] = lowStockAssets.map((asset) => {
        const qty = Number(asset.quantity ?? 0);
        const minLevel = getThresholdForAsset(asset);
        const computedStatus = getStockStatus(qty, minLevel);
        const statusLabel = computedStatus === 'out-of-stock' ? 'Out of Stock' : 'Low Stock';
        return {
            label: `${asset.asset_name} (${statusLabel}: ${qty})`,
            value: String(asset.id),
        };
    });

    return (
        <ScrollView showsVerticalScrollIndicator={false} scrollEnabled nestedScrollEnabled>
            <View className="flex-row items-center justify-between mb-5">
                <Text className="text-2xl font-bold text-foreground">
                    {isAddStockMode ? 'Refill Existing Asset Stock' : 'Add Asset'}
                </Text>
                <Pressable onPress={onClose}>
                    <Text className="text-lg text-foreground">X</Text>
                </Pressable>
            </View>

            {isAddStockMode ? (
                <>
                    <View className="mb-5">
                        <Text className="mb-1 font-semibold text-foreground">Low Stock Asset</Text>
                        <Select value={selectedLowStockAsset} onValueChange={setSelectedLowStockAsset}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingLowStockAssets ? 'Loading low-stock assets...' : 'Select an asset'} />
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
                                const selectedStatusLabel = selectedStatus === 'out-of-stock' ? 'Out of Stock' : selectedStatus === 'low-stock' ? 'Low Stock' : 'In Stock';
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
            ) : (
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
                        <NumberIncrementer
                            label="Quantity"
                            value={quantity}
                            onChange={setQuantity}
                            min={0}
                            max={9999}
                            step={1}
                        />
                    </View>

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

                </>
            )}

            <View className="flex-row items-center gap-3 mt-2">
                <Pressable onPress={onClose} className="flex-1 border border-border py-3.5 rounded-xl items-center">
                    <Text className="text-foreground font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                    className="flex-1 bg-primary py-3.5 rounded-xl items-center"
                    onPress={isAddStockMode ? refillExistingAssetStock : addAsset}
                >
                    <Text className="text-white font-semibold">{isAddStockMode ? 'Update Stock' : 'Add Asset'}</Text>
                </Pressable>
            </View>
            <View className="h-24" />
        </ScrollView>
    );
};