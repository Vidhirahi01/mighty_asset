import React, { useEffect, useRef, useState } from "react";
import { Pressable, FlatList, View, Alert } from "react-native";
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

export const AddAssetForm = ({ onClose, presetAction, forceClassicAddForm }: AddAssetFormProps) => {
    const isAddStockMode = presetAction === 'add-stock';
    const isClassicAddMode = !!forceClassicAddForm && !isAddStockMode;
    const [showBulkAddForm, setShowBulkAddForm] = useState(false);

    const [assetName, setAssetName] = useState("");
    const [category, setCategory] = useState<SelectOption | undefined>(undefined);
    const [brand, setBrand] = useState("");
    const [modelNo, setModelNo] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
    const [isLoadingAssetOptions, setIsLoadingAssetOptions] = useState(false);
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

    const selectedAssetRecord = lowStockAssets.find(
        (asset) => String(asset.id) === selectedLowStockAsset?.value
    );
    const isBulkAddMode = !isAddStockMode || showBulkAddForm;
    const useAssetDropdown = !isClassicAddMode;
    const selectedAssetOption = assetOptions.find((item) => item.value === assetName);

    const makeVariantKey = (asset: {
        category: string | null | undefined;
        brand?: string | null;
        model_no?: string | null;
    }) => {
        const categoryKey = String(asset.category ?? '').trim().toLowerCase() || 'uncategorized';
        const brandKey = String(asset.brand ?? '').trim().toLowerCase() || 'na';
        const modelKey = String(asset.model_no ?? '').trim().toLowerCase() || 'na';
        return `${categoryKey}::${brandKey}::${modelKey}`;
    };

    useEffect(() => {
        if (!isAddStockMode) return;

        const loadLowStockAssets = async () => {
            setIsLoadingLowStockAssets(true);
            const { data, error } = await supabase
                .from('asset_table')
                .select('id, asset_name, category, brand, model_no, status, condition, image_url, note');

            setIsLoadingLowStockAssets(false);

            if (error) {
                Alert.alert('Error', 'Failed to load low stock assets.');
                return;
            }

            const assets = (data ?? []) as AssetRecord[];

            const groupedAssets = new Map<string, AssetRecord>();

            assets.forEach((asset) => {
                const key = makeVariantKey(asset);
                const existing = groupedAssets.get(key);

                if (existing) {
                    existing.quantity = Number(existing.quantity ?? 0) + 1;
                    return;
                }

                groupedAssets.set(key, {
                    ...asset,
                    id: key,
                    quantity: 1,
                });
            });

            const filteredLowStockAssets = Array.from(groupedAssets.values()).filter((asset) => {
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

    useEffect(() => {
        if (!isBulkAddMode || isClassicAddMode) return;

        if (!category?.value) {
            setAssetOptions([]);
            setAssetName("");
            return;
        }

        const loadAssetOptions = async () => {
            setIsLoadingAssetOptions(true);

            const { data, error } = await supabase
                .from('asset_table')
                .select('asset_name')
                .eq('category', category.value);

            setIsLoadingAssetOptions(false);

            if (error) {
                Alert.alert('Error', 'Failed to load assets for selected category.');
                setAssetOptions([]);
                return;
            }

            const uniqueAssets = Array.from(
                new Set(
                    ((data ?? []) as Array<{ asset_name: string | null }>)
                        .map((row) => String(row.asset_name ?? '').trim())
                        .filter(Boolean)
                )
            );

            const options = uniqueAssets.map((name) => ({ label: name, value: name }));
            setAssetOptions(options);

            if (!options.some((item) => item.value === assetName)) {
                setAssetName("");
            }
        };

        loadAssetOptions();
    }, [category?.value, isBulkAddMode, isClassicAddMode]);

    useEffect(() => {
        if (!useAssetDropdown) return;
        if (!assetOptions.some((item) => item.value === assetName)) {
            setAssetName("");
        }
    }, [assetName, assetOptions, useAssetDropdown]);

    const addAsset = async () => {
        if (quantity <= 0) {
            Alert.alert('Invalid Quantity', 'Quantity should be at least 1.');
            return;
        }

        if (isClassicAddMode) {
            if (!assetName.trim() || !category?.value || !brand.trim() || !modelNo.trim()) {
                Alert.alert('Missing Details', 'Asset name, category, brand and model are required.');
                return;
            }
        } else if (!assetName.trim() || !category?.value) {
            Alert.alert('Missing Details', 'Please select category and asset.');
            return;
        }

        try {
            const rowsToInsert = Array.from({ length: numericQuantity }, () => ({
                asset_name: assetName,
                category: category?.value ?? null,
                note: notes,
                warranty_expiry: warrantyExpiry ? warrantyExpiry.toISOString().slice(0, 10) : null,
                purchase_date: purchaseDate ? purchaseDate.toISOString().slice(0, 10) : null,
                condition: condition?.value ?? null,
                serial_no: isClassicAddMode ? (numericQuantity === 1 ? (serialNo || null) : null) : null,
                model_no: isClassicAddMode ? (modelNo || null) : null,
                brand: isClassicAddMode ? (brand || null) : null,
                status: 'AVAILABLE',
                assigned_to: null,
                image_url: imageUrl,
            }));

            const { data, error } = await supabase
                .from("asset_table")
                .insert(rowsToInsert);

            if (error) {
                console.log("Error:", error.message);
                return;
            }

            console.log("Inserted:", data);

            Alert.alert('Success', `${numericQuantity} unit${numericQuantity > 1 ? 's' : ''} added for ${assetName}.`);

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

        const rowsToInsert = Array.from({ length: quantity }, () => ({
            asset_name: selectedAssetRecord.asset_name,
            category: selectedAssetRecord.category,
            brand: selectedAssetRecord.brand ?? null,
            model_no: selectedAssetRecord.model_no ?? null,
            condition: condition.value,
            image_url: imageUrl ?? selectedAssetRecord.image_url,
            note: notes || selectedAssetRecord.note,
            status: 'AVAILABLE',
            assigned_to: null,
            serial_no: null,
        }));

        const { error } = await supabase
            .from('asset_table')
            .insert(rowsToInsert);

        if (error) {
            Alert.alert('Error', 'Failed to update stock.');
            return;
        }

        Alert.alert('Stock Updated', `${quantity} unit${quantity > 1 ? 's' : ''} added to ${selectedAssetRecord.asset_name}.`);
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
        <FlatList
            data={[]}
            keyExtractor={(_, index) => String(index)}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
                <>
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-2xl font-bold text-foreground">
                            {isBulkAddMode ? (isClassicAddMode ? 'Add Asset' : 'Add Asset (Bulk)') : 'Refill Existing Asset Stock'}
                        </Text>
                        <Pressable onPress={onClose}>
                            <Text className="text-lg text-foreground">X</Text>
                        </Pressable>
                    </View>

                    {!isBulkAddMode ? (
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
                            useAssetDropdown={useAssetDropdown}
                            assetName={assetName}
                            setAssetName={setAssetName}
                            selectedAssetOption={selectedAssetOption}
                            setSelectedAssetOption={(value) => setAssetName(value?.value ?? "")}
                            assetOptions={assetOptions}
                            isLoadingAssetOptions={isLoadingAssetOptions}
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
                            onPress={isBulkAddMode ? addAsset : refillExistingAssetStock}
                        >
                            <Text className="text-white font-semibold">{isBulkAddMode ? (isClassicAddMode ? 'Add Asset' : 'Update Asset') : 'Update Stock'}</Text>
                        </Pressable>
                    </View>

                    {isAddStockMode && !showBulkAddForm && (
                        <Pressable
                            onPress={() => setShowBulkAddForm(true)}
                            className="mt-3 rounded-xl border border-primary bg-primary/5 py-3.5 items-center"
                        >
                            <Text className="text-primary font-semibold">Add New Asset Instead (Bulk)</Text>
                        </Pressable>
                    )}

                    {isAddStockMode && showBulkAddForm && (
                        <Pressable
                            onPress={() => setShowBulkAddForm(false)}
                            className="mt-3 rounded-xl border border-border bg-accent py-3.5 items-center"
                        >
                            <Text className="text-foreground font-semibold">Back to Low Stock Update</Text>
                        </Pressable>
                    )}

                    <View className="h-24" />
                </>
            }
        />
    );
};