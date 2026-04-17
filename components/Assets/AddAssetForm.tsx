import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { AddStockModeFields } from "@/components/Assets/add-asset-form/AddStockModeFields";
import { NewAssetModeFields } from "@/components/Assets/add-asset-form/NewAssetModeFields";
import {
    categories,
    CATEGORY_MIN_STOCK_LEVEL,
    conditions,
    DEFAULT_MIN_STOCK_LEVEL,
    getStockStatus,
    getThresholdForAsset,
    type AddAssetFormProps,
    type AssetRecord,
    type SelectOption,
} from "@/components/Assets/add-asset-form/formTypes";

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

        if (quantity <= 0) {
            Alert.alert('Invalid Quantity', 'Please choose refill quantity greater than 0.');
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
                <AddStockModeFields
                    selectedLowStockAsset={selectedLowStockAsset}
                    setSelectedLowStockAsset={setSelectedLowStockAsset}
                    isLoadingLowStockAssets={isLoadingLowStockAssets}
                    lowStockAssetOptions={lowStockAssetOptions}
                    selectedAssetRecord={selectedAssetRecord}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    condition={condition}
                    setCondition={setCondition}
                    conditions={conditions}
                    notes={notes}
                    setNotes={setNotes}
                    setImageUrl={setImageUrl}
                    getThresholdForAsset={getThresholdForAsset}
                    getStockStatus={getStockStatus}
                />
            ) : (
                <NewAssetModeFields
                    assetName={assetName}
                    setAssetName={setAssetName}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                    brand={brand}
                    setBrand={setBrand}
                    modelNo={modelNo}
                    setModelNo={setModelNo}
                    serialNo={serialNo}
                    setSerialNo={setSerialNo}
                    assetId={assetIdRef.current}
                    condition={condition}
                    setCondition={setCondition}
                    conditions={conditions}
                    purchaseDate={purchaseDate}
                    showPurchasePicker={showPurchasePicker}
                    setShowPurchasePicker={setShowPurchasePicker}
                    setPurchaseDate={setPurchaseDate}
                    price={price}
                    setPrice={setPrice}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    warrantyExpiry={warrantyExpiry}
                    showWarrantyPicker={showWarrantyPicker}
                    setShowWarrantyPicker={setShowWarrantyPicker}
                    setWarrantyExpiry={setWarrantyExpiry}
                    notes={notes}
                    setNotes={setNotes}
                    setImageUrl={setImageUrl}
                />
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