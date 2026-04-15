import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type AssetStatus = 'available' | 'assigned' | 'inRepair';

type CategorySummary = {
    id: string;
    key: string;
    category: string;
    total: number;
    available: number;
    assigned: number;
    inRepair: number;
};

type AssetRow = {
    id: string | number | null;
    category: string | null;
    status: string | null;
};

const FIXED_CATEGORIES: Array<{ key: string; label: string }> = [
    { key: 'laptops', label: 'Laptops' },
    { key: 'monitors', label: 'Monitor' },
    { key: 'keyboards', label: 'Keyboard' },
    { key: 'cables', label: 'Cable' },
    { key: 'mouse', label: 'Mouse' },
    { key: 'printers', label: 'Printer' },
    { key: 'tablets', label: 'Tablet' },
];

const normalizeCategoryKey = (value: string | null | undefined) => {
    const normalized = (value ?? '').trim().toLowerCase();

    if (normalized.startsWith('laptop')) return 'laptops';
    if (normalized.startsWith('monitor')) return 'monitors';
    if (normalized.startsWith('keyboard')) return 'keyboards';
    if (normalized.startsWith('cable')) return 'cables';
    if (normalized === 'mouse' || normalized === 'mice') return 'mouse';
    if (normalized.startsWith('printer')) return 'printers';
    if (normalized.startsWith('tablet')) return 'tablets';

    return normalized || 'uncategorized';
};

const mapStatusBucket = (status: string | null): AssetStatus => {
    const normalized = (status ?? '').toLowerCase();

    if (normalized.includes('repair') || normalized.includes('maintenance')) return 'inRepair';
    if (normalized.includes('assign') || normalized.includes('allocated') || normalized.includes('in use')) return 'assigned';
    return 'available';
};

function CategoryAssetCard({ item, onPress }: { item: CategorySummary; onPress: () => void }) {
    return (
        <Pressable onPress={onPress}>
            <Card className="mb-3 border border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-foreground text-base">{item.category}</CardTitle>
                </CardHeader>
                <CardContent>
                    <View className="flex-row items-center justify-between rounded-xl bg-primary/10 px-3 py-2">
                        <Text className="text-xs text-foreground/70">Total</Text>
                        <Text className="text-sm font-bold text-foreground">{item.total}</Text>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between gap-2">
                        <View className="flex-1 rounded-xl bg-green-500/15 px-3 py-2">
                            <Text className="text-xs text-green-700">Available</Text>
                            <Text className="text-lg font-bold text-foreground">{item.available}</Text>
                        </View>
                        <View className="flex-1 rounded-xl bg-blue-500/15 px-3 py-2">
                            <Text className="text-xs text-blue-700">Assigned</Text>
                            <Text className="text-lg font-bold text-foreground">{item.assigned}</Text>
                        </View>
                        <View className="flex-1 rounded-xl bg-amber-500/15 px-3 py-2">
                            <Text className="text-xs text-amber-700">In Repair</Text>
                            <Text className="text-lg font-bold text-foreground">{item.inRepair}</Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </Pressable>
    );
}

export default function AssetCategoryScreen() {
    const [categories, setCategories] = useState<CategorySummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const router = useRouter();

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from('asset_table')
                .select('id, category, status, asset_name, model_no, brand');

            if (error) throw error;

            const map = new Map<string, CategorySummary>();

            FIXED_CATEGORIES.forEach((category, index) => {
                map.set(category.key, {
                    id: `cat-${index}-${category.key}`,
                    key: category.key,
                    category: category.label,
                    total: 0,
                    available: 0,
                    assigned: 0,
                    inRepair: 0,
                });
            });

            ((data as AssetRow[] | null) ?? []).forEach((row, index) => {
                const key = normalizeCategoryKey(row.category);
                if (!map.has(key)) return;

                const entry = map.get(key)!;
                entry.total += 1;
                const bucket = mapStatusBucket(row.status);
                entry[bucket] += 1;
            });

            setCategories(FIXED_CATEGORIES.map((item) => map.get(item.key)!));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setLoadError(error instanceof Error ? error.message : String(error));
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const quickStats = useMemo(() => {
        return categories.reduce(
            (acc, item) => {
                acc.total += item.total;
                acc.available += item.available;
                acc.assigned += item.assigned;
                return acc;
            },
            { total: 0, available: 0, assigned: 0 }
        );
    }, [categories]);

    const lowStockAlerts = categories.filter((item) => item.total > 0 && item.available <= 2);

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
                <View className="mb-4">
                    <Text className="text-2xl font-bold text-foreground">Asset Categories</Text>
                    <Text className="text-sm text-muted-foreground">Browse assets by category with status distribution.</Text>
                </View>

                {isLoading && (
                    <Card className="mb-3 border border-border bg-card">
                        <CardContent className="py-6">
                            <Text className="text-center text-sm text-muted-foreground">Loading categories...</Text>
                        </CardContent>
                    </Card>
                )}

                {loadError && (
                    <Card className="mb-3 border border-red-300 bg-red-50">
                        <CardContent className="py-4">
                            <Text className="text-sm text-red-700">Failed to load categories: {loadError}</Text>
                            <Pressable onPress={fetchCategories} className="mt-3 self-start rounded-lg bg-red-600 px-3 py-2">
                                <Text className="text-xs font-semibold text-white">Retry</Text>
                            </Pressable>
                        </CardContent>
                    </Card>
                )}

                <FlatList
                    scrollEnabled={false}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CategoryAssetCard
                            item={item}
                            onPress={() =>
                                router.push({
                                    pathname: './category-assets',
                                    params: { category: item.key },
                                })
                            }
                        />
                    )}
                    ListEmptyComponent={
                        <Card className="border border-border bg-card">
                            <CardContent className="py-6">
                                <Text className="text-center text-sm text-muted-foreground">No categories found for this search.</Text>
                            </CardContent>
                        </Card>
                    }
                />

                <Card className="mt-4 border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <View className="flex-row gap-2">
                            <View className="flex-1 rounded-xl bg-primary px-3 py-3">
                                <Text className="text-xs text-white/80">Total Assets</Text>
                                <Text className="text-xl font-bold text-white">{quickStats.total}</Text>
                            </View>
                            <View className="flex-1 rounded-xl bg-green-600 px-3 py-3">
                                <Text className="text-xs text-white/80">Available</Text>
                                <Text className="text-xl font-bold text-white">{quickStats.available}</Text>
                            </View>
                            <View className="flex-1 rounded-xl bg-blue-600 px-3 py-3">
                                <Text className="text-xs text-white/80">Assigned</Text>
                                <Text className="text-xl font-bold text-white">{quickStats.assigned}</Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                <Card className="mt-4 border border-amber-300 bg-amber-50">
                    <CardHeader>
                        <View className="flex-row items-center gap-2">
                            <AlertTriangle size={18} color="#b45309" />
                            <CardTitle className="text-amber-800">Low Asset Alert</CardTitle>
                        </View>
                    </CardHeader>
                    <CardContent>
                        {lowStockAlerts.length === 0 ? (
                            <Text className="text-sm text-amber-800">All categories have healthy stock levels.</Text>
                        ) : (
                            lowStockAlerts.map((item) => (
                                <View key={item.id} className="mb-2 rounded-xl border border-amber-300 bg-white px-3 py-2">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-sm font-semibold text-foreground">{item.category}</Text>
                                        <Text className="text-xs text-amber-700">Available: {item.available}</Text>
                                    </View>
                                    <Pressable className="mt-2 items-center rounded-lg bg-amber-600 px-3 py-2">
                                        <Text className="text-xs font-semibold text-white">Stock Upgrade</Text>
                                    </Pressable>
                                </View>
                            ))
                        )}
                    </CardContent>
                </Card>
            </ScrollView>
        </View>
    );
}
