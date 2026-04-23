// app/(manager)/inventory.tsx
import React from 'react';
import { View, ScrollView, FlatList, Pressable, Alert, PressableStateCallbackType, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { BadgeCheck, Sigma, UserRoundCheck, Wrench, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAssets, useAssetStats } from '@/hooks/queries/useAssets';
import { useManagerRequests, useUpdateRequestStatus } from '@/hooks/queries/useRequests';

// ─── STAT CARD ────────────────────────────────────────────────────────────────

type StatItem = { label: string; count: number };
type NormalizedAssetStatus = 'available' | 'assigned' | 'in_repair' | 'other';

type CategoryBreakdown = {
    id: string;
    name: string;
    assigned: number;
    available: number;
    inRepair: number;
};

type LowStockItem = {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    status: 'Critical' | 'Warning';
};

type StockRequest = {
    id: string;
    itemName: string;
    status: string;
    requestType: 'add-stock' | 'set-reorder-alert';
    requestedBy: string;
    requestedAt: string;
};

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeAssetStatus = (value: string | null | undefined): NormalizedAssetStatus => {
    const status = (value ?? '').toLowerCase().replace(/[_\s-]/g, '');
    if (status === 'available') return 'available';
    if (status === 'assigned' || status === 'inuse') return 'assigned';
    if (status === 'inrepair' || status === 'repair' || status === 'maintenance') return 'in_repair';
    return 'other';
};

const getRelativeTime = (isoDate: string) => {
    const created = new Date(isoDate).getTime();
    const diffMinutes = Math.max(1, Math.floor((Date.now() - created) / (1000 * 60)));

    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getRequestType = (reason: string | null): StockRequest['requestType'] => {
    const normalizedReason = (reason ?? '').toLowerCase();
    if (normalizedReason.includes('reorder')) {
        return 'set-reorder-alert';
    }
    return 'add-stock';
};

function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Total Assets': return <Sigma {...iconProps} />;
            case 'Available': return <BadgeCheck {...iconProps} />;
            case 'Assigned': return <UserRoundCheck {...iconProps} />;
            case 'In Repair': return <Wrench {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="mx-2 my-2 flex-1 bg-primary border border-primary shadow-lg">
            <CardContent className="px-5 py-6 items-center justify-center">
                <View className="mb-2 p-2 rounded-full bg-white/20">
                    {getIcon(item.label)}
                </View>
                <Text className="text-white text-xs text-center opacity-90">{item.label}</Text>
                <Text className="mt-3 text-white text-4xl font-bold text-center">{item.count}</Text>
            </CardContent>
        </Card>
    );
}
function CategoryCard({ category }: { category: CategoryBreakdown }) {
    const total = category.assigned + category.available + category.inRepair;
    return (
        <Card className="bg-card border border-border rounded-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="text-foreground text-base">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-2">
                    <View className="flex-row items-center justify-between p-2 bg-foreground/5 rounded">
                        <Text className="text-foreground/60 text-sm">Assigned</Text>
                        <Text className="text-foreground font-bold">{category.assigned}</Text>
                    </View>
                    <View className="flex-row items-center justify-between p-2 bg-success/10 rounded">
                        <Text className="text-foreground/60 text-sm">Available</Text>
                        <Text className="text-success font-bold">{category.available}</Text>
                    </View>
                    <View className="flex-row items-center justify-between p-2 bg-warning/10 rounded">
                        <Text className="text-foreground/60 text-sm">In Repair</Text>
                        <Text className="text-warning font-bold">{category.inRepair}</Text>
                    </View>
                    <View className="border-t border-border/50 pt-2 mt-2">
                        <Text className="text-foreground/50 text-xs text-center">Total: {total}</Text>
                    </View>
                </View>
            </CardContent>
        </Card>
    );
}

function LowStockCard({ item }: { item: LowStockItem }) {
    const color = item.status === 'Critical' ? '#ef4444' : '#f59e0b';
    const shortagePercent = Math.round((item.currentStock / item.minimumStock) * 100);

    return (
        <View
            className="p-3 rounded-lg mb-2"
            style={{ backgroundColor: color + '10', borderLeftWidth: 4, borderLeftColor: color }}
        >
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 flex-row items-center gap-2">
                    <AlertTriangle size={16} color={color} strokeWidth={2} />
                    <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
                        <Text className="text-foreground/60 text-xs mt-1">{item.category}</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: color + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{item.status}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-foreground/60 text-xs mb-1">
                        Stock: {item.currentStock} / Min: {item.minimumStock}
                    </Text>
                    <View className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{ backgroundColor: color, width: `${Math.min(100, shortagePercent)}%` }}
                        />
                    </View>
                </View>
                <Text className="text-foreground/50 text-xs ml-3 min-w-12 text-right">
                    {shortagePercent}% left
                </Text>
            </View>
        </View>
    );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function InventoryScreen() {
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const router = useRouter();
    const isOperationsMode = mode === 'operations';

    const { data: stats, isLoading: statsLoading } = useAssetStats();
    const { data: assets = [], isLoading: assetsLoading } = useAssets();
    const { data: managerRequests = [], isLoading: requestsLoading } = useManagerRequests();

    const updateRequestStatus = useUpdateRequestStatus();

    const categories: CategoryBreakdown[] = React.useMemo(() => {
        const map = new Map<string, CategoryBreakdown>();

        for (const asset of assets) {
            const categoryName = toTitle(asset.category ?? 'uncategorized');
            const existing = map.get(categoryName) ?? {
                id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: categoryName,
                assigned: 0,
                available: 0,
                inRepair: 0,
            };

            const status = normalizeAssetStatus(asset.status);
            if (status === 'assigned') existing.assigned += 1;
            if (status === 'available') existing.available += 1;
            if (status === 'in_repair') existing.inRepair += 1;

            map.set(categoryName, existing);
        }

        return Array.from(map.values());
    }, [assets]);

    const lowStockItems: LowStockItem[] = React.useMemo(() => {
        return assets
            .filter((asset) => {
                const quantity = Number(asset.quantity ?? 0);
                const minimum = Number(asset.minimum_stock_level ?? 0);
                return minimum > 0 && quantity < minimum;
            })
            .map((asset) => {
                const currentStock = Number(asset.quantity ?? 0);
                const minimumStock = Number(asset.minimum_stock_level ?? 0);

                return {
                    id: String(asset.id),
                    name: asset.asset_name || 'Unnamed Asset',
                    category: toTitle(asset.category ?? 'uncategorized'),
                    currentStock,
                    minimumStock,
                    status: currentStock <= Math.floor(minimumStock / 2) ? 'Critical' : 'Warning',
                };
            });
    }, [assets]);

    const stockRequests: StockRequest[] = React.useMemo(() => {
        return managerRequests
            .filter((request) => String(request.status).toUpperCase() === 'PENDING')
            .map((request) => {
                const requestedBy =
                    request.requester_name ||
                    (request.email?.split('@')[0] || 'Operations Team').replace(/\./g, ' ');
                const quantityText = request.quantity ? ` x${request.quantity}` : '';

                return {
                    id: request.id,
                    itemName: `${toTitle(request.category || 'asset')}${quantityText}`,
                    status: String(request.status).toUpperCase(),
                    requestType: getRequestType(request.reason),
                    requestedBy,
                    requestedAt: getRelativeTime(request.created_at),
                };
            });
    }, [managerRequests]);

    // Build stats array for the cards — falls back to 0 while loading
    const STATS: StatItem[] = [
        { label: 'Total Assets', count: stats?.total ?? 0 },
        { label: 'Available', count: stats?.available ?? 0 },
        { label: 'Assigned', count: stats?.assigned ?? 0 },
        { label: 'In Repair', count: stats?.inRepair ?? 0 },
    ];

    const openInventoryActionDrawer = (action?: StockRequest['requestType']) => {
        router.push({
            pathname: '/dashboard',
            params: action ? { openAddAsset: '1', stockAction: action } : { openAddAsset: '1' },
        });
    };

    // ── CHANGE: approve now calls Supabase and auto-refreshes the list ────────
    const handleApprove = (requestId: string) => {
        Alert.alert('Approve Request', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: () =>
                    updateRequestStatus.mutate({ requestId, status: 'APPROVED' }, {
                        onSuccess: () => Alert.alert('Approved', 'Request approved successfully.'),
                        onError: (err: Error) => Alert.alert('Error', err.message || 'Failed to approve.'),
                    }),
            },
        ]);
    };

    // ── CHANGE: reject now calls Supabase and auto-refreshes the list ─────────
    const handleReject = (requestId: string) => {
        Alert.alert('Reject Request', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: () =>
                    updateRequestStatus.mutate({ requestId, status: 'REJECTED' }, {
                        onSuccess: () => Alert.alert('Rejected', 'Request rejected.'),
                        onError: (err: Error) => Alert.alert('Error', err.message || 'Failed to reject.'),
                    }),
            },
        ]);
    };

    const getRequestTypeLabel = (type: StockRequest['requestType']) =>
        type === 'add-stock' ? 'Add Stock' : 'Set Reorder Alert';

    const quickActionPressStyle = ({ pressed }: PressableStateCallbackType) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
    });

    const categoriesLoading = assetsLoading;
    const lowStockLoading = assetsLoading;
    const isLoading = statsLoading || assetsLoading;

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {isOperationsMode && (
                    <Pressable
                        onPress={() => router.replace('/dashboard')}
                        className="mb-1 self-start rounded-lg border border-border bg-card p-2.5"
                    >
                        <ArrowLeft size={16} color="#6b7280" />
                    </Pressable>
                )}

                <Card className="bg-card border border-border rounded-xl">
                    <CardContent className="py-3">
                        <Text className="text-sm font-semibold text-foreground">
                            {isOperationsMode ? 'Operations Mode: Request Changes' : 'Manager Mode: Approval View'}
                        </Text>
                        <Text className="text-xs text-foreground/60 mt-1">
                            {isOperationsMode
                                ? 'You can request stock changes. Manager will approve requests.'
                                : 'Editing is disabled for managers. Approve or reject operation requests only.'}
                        </Text>
                    </CardContent>
                </Card>

                {/* ── Stats Cards — real data, shows 0 while loading ── */}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#1b72fc" style={{ marginVertical: 20 }} />
                ) : (
                    <FlatList
                        data={STATS}
                        keyExtractor={(item) => item.label}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => <MyCard item={item} />}
                        scrollEnabled={false}
                    />
                )}

                {/* ── Quick Actions (Operations only) ── */}
                {isOperationsMode && (
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Quick Actions</CardTitle>
                            <CardDescription className="text-foreground/60">
                                Low stock recharge or new stock bulk update
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <View className="gap-3">
                                <Pressable
                                    onPress={() => openInventoryActionDrawer('add-stock')}
                                    className="w-full items-center rounded-lg bg-primary px-3 py-3"
                                    style={quickActionPressStyle}
                                >
                                    <Text className="text-white text-xs font-semibold">Low Stock Recharge</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => openInventoryActionDrawer()}
                                    className="w-full items-center rounded-lg bg-primary px-3 py-3"
                                    style={quickActionPressStyle}
                                >
                                    <Text className="text-white text-xs font-semibold">New Stock (Bulk Update)</Text>
                                </Pressable>
                            </View>
                        </CardContent>
                    </Card>
                )}

                {/* ── Operation Requests (Manager only) — real data ── */}
                {!isOperationsMode && (
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Operation Requests</CardTitle>
                            <CardDescription className="text-foreground/60">
                                {requestsLoading
                                    ? 'Loading...'
                                    : `${stockRequests.length} pending request${stockRequests.length !== 1 ? 's' : ''}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="gap-2">
                            {requestsLoading ? (
                                <ActivityIndicator color="#1b72fc" />
                            ) : stockRequests.length === 0 ? (
                                <Text className="text-foreground/40 text-sm text-center py-4">
                                    No pending requests
                                </Text>
                            ) : (
                                stockRequests.map((request) => (
                                    <View key={request.id} className="rounded-lg border border-border p-3">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-sm font-semibold text-foreground">
                                                {request.itemName}
                                            </Text>
                                            <View className="rounded-full bg-amber-500/20 px-2 py-1">
                                                <Text className="text-[10px] font-bold text-amber-700">
                                                    {request.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs text-foreground/70 mt-1">
                                            {getRequestTypeLabel(request.requestType)}
                                        </Text>
                                        <Text className="text-xs text-foreground/60">
                                            {request.requestedBy} • {request.requestedAt}
                                        </Text>
                                        <View className="flex-row gap-2 mt-3">
                                            <Pressable
                                                onPress={() => handleApprove(request.id)}
                                                disabled={updateRequestStatus.isPending}
                                                className="rounded-md bg-emerald-600 px-3 py-1.5"
                                            >
                                                <Text className="text-xs font-semibold text-white">Approve</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleReject(request.id)}
                                                disabled={updateRequestStatus.isPending}
                                                className="rounded-md bg-red-600 px-3 py-1.5"
                                            >
                                                <Text className="text-xs font-semibold text-white">Reject</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Assets by Category — real data ── */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Assets by Category</CardTitle>
                        <CardDescription className="text-foreground/60">
                            View inventory status by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoriesLoading ? (
                            <ActivityIndicator color="#1b72fc" />
                        ) : categories.length === 0 ? (
                            <Text className="text-foreground/40 text-sm text-center py-4">No assets found</Text>
                        ) : (
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <CategoryCard category={item} />}
                                scrollEnabled={false}
                                contentContainerStyle={{ gap: 12 }}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* ── Low Stock Items — real data ── */}
                <Card className="bg-card border border-destructive/30 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg flex-row items-center gap-2">
                            <AlertTriangle size={20} color="#ef4444" strokeWidth={2} />
                            <Text>Low Stock Items</Text>
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            {lowStockLoading
                                ? 'Checking stock levels...'
                                : `${lowStockItems.length} item${lowStockItems.length !== 1 ? 's' : ''} below minimum threshold`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lowStockLoading ? (
                            <ActivityIndicator color="#ef4444" />
                        ) : lowStockItems.length === 0 ? (
                            <Text className="text-foreground/40 text-sm text-center py-4">
                                ✅ All stock levels are healthy
                            </Text>
                        ) : (
                            <FlatList
                                data={lowStockItems}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <LowStockCard item={item} />}
                                scrollEnabled={false}
                            />
                        )}
                    </CardContent>
                </Card>
            </View>

            <View style={{ height: 160 }} />
        </ScrollView>
    );
}