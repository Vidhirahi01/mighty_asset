import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';

type AssetStatus = 'available' | 'assigned' | 'inRepair';

type AssetItem = {
    id: string;
    name: string;
    imageUrl: string;
    status: AssetStatus;
    brand: string;
    model: string;
    serial: string;
};

type AssetRow = {
    id: string | number | null;
    asset_name: string | null;
    category: string | null;
    brand: string | null;
    model_no: string | null;
    serial_no: string | null;
    status: string | null;
    image_url: string | null;
};

const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/asset-fallback/120/120';

const mapStatus = (status: string | null): AssetStatus => {
    const normalized = (status ?? '').toLowerCase();

    if (normalized.includes('repair') || normalized.includes('maintenance')) return 'inRepair';
    if (normalized.includes('assign') || normalized.includes('in use') || normalized.includes('allocated')) return 'assigned';
    return 'available';
};

function AssetDetailCard({ asset }: { asset: AssetItem }) {
    const statusBadgeClass =
        asset.status === 'available'
            ? 'bg-green-500/15'
            : asset.status === 'assigned'
                ? 'bg-blue-500/15'
                : 'bg-amber-500/15';

    const statusText = asset.status === 'inRepair' ? 'In Repair' : asset.status[0].toUpperCase() + asset.status.slice(1);

    return (
        <Card className="mb-3 border border-border bg-card">
            <CardContent className="p-3">
                <View className="flex-row gap-3">
                    <Image source={{ uri: asset.imageUrl }} className="h-16 w-16 rounded-lg" resizeMode="cover" />
                    <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{asset.name}</Text>
                        <Text className="text-xs text-muted-foreground">{asset.id}</Text>
                        <View className={`mt-2 self-start rounded-md px-2 py-1 ${statusBadgeClass}`}>
                            <Text className="text-xs font-medium text-foreground">{statusText}</Text>
                        </View>
                    </View>
                </View>
                <View className="mt-3 flex-row flex-wrap gap-3">
                    <Text className="text-xs text-muted-foreground">Brand: <Text className="text-foreground">{asset.brand}</Text></Text>
                    <Text className="text-xs text-muted-foreground">Model: <Text className="text-foreground">{asset.model}</Text></Text>
                    <Text className="text-xs text-muted-foreground">Serial: <Text className="text-foreground">{asset.serial}</Text></Text>
                </View>
            </CardContent>
        </Card>
    );
}

export default function CategoryAssetsScreen() {
    const { category } = useLocalSearchParams<{ category?: string }>();
    const router = useRouter();
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categoryName = useMemo(() => (typeof category === 'string' && category.trim() ? category.trim() : 'Uncategorized'), [category]);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const { data, error } = await supabase
                    .from('asset_table')
                    .select('id, asset_name, category, brand, model_no, serial_no, status, image_url')
                    .eq('category', categoryName);

                if (error) throw error;

                const mapped = ((data as AssetRow[] | null) ?? []).map((row, index) => ({
                    id: String(row.id ?? `asset-${index}`),
                    name: row.asset_name?.trim() || 'Unnamed Asset',
                    imageUrl: row.image_url?.trim() || FALLBACK_IMAGE_URL,
                    status: mapStatus(row.status),
                    brand: row.brand?.trim() || 'N/A',
                    model: row.model_no?.trim() || 'N/A',
                    serial: row.serial_no?.trim() || 'N/A',
                }));

                setAssets(mapped);
            } catch (e) {
                console.error('Failed to fetch assets by category:', e);
                setError(e instanceof Error ? e.message : String(e));
                setAssets([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssets();
    }, [categoryName]);

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
                <View className="mb-4">
                    <Pressable onPress={() => router.replace('/asset-category')} className="mb-3 self-start rounded-lg border border-border bg-card p-2.5">
                        <ArrowLeft size={16} color="#6b7280" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-foreground">{categoryName}</Text>
                    <Text className="text-sm text-muted-foreground">All assets in this category.</Text>
                </View>

                {isLoading && (
                    <Card className="mb-3 border border-border bg-card">
                        <CardContent className="py-6">
                            <Text className="text-center text-sm text-muted-foreground">Loading assets...</Text>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="mb-3 border border-red-300 bg-red-50">
                        <CardContent className="py-4">
                            <Text className="text-sm text-red-700">Failed to load assets: {error}</Text>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && assets.length === 0 && (
                    <Card className="mb-3 border border-border bg-card">
                        <CardContent className="py-6">
                            <Text className="text-center text-sm text-muted-foreground">No assets found in this category.</Text>
                        </CardContent>
                    </Card>
                )}

                {assets.map((asset) => (
                    <AssetDetailCard key={asset.id} asset={asset} />
                ))}
            </ScrollView>
        </View>
    );
}
