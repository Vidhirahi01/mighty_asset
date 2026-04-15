import React from 'react';
import { View, ScrollView, FlatList, Pressable, Alert, PressableStateCallbackType } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { BadgeCheck, Sigma, UserRoundCheck, Wrench, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'expo-router';

type StatItem = {
    label: string;
    count: number;
};

type AssetCategory = {
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
    requestType: 'add-stock' | 'update-stock-level' | 'set-reorder-alert';
    requestedBy: string;
    requestedAt: string;
    status: 'Pending';
};

const STATS: StatItem[] = [
    { label: 'Total Assets', count: 247 },
    { label: 'Available', count: 68 },
    { label: 'Assigned', count: 165 },
    { label: 'In Repair', count: 14 },
];

const ASSET_CATEGORIES: AssetCategory[] = [
    { id: '1', name: 'Laptops', assigned: 45, available: 12, inRepair: 3 },
    { id: '2', name: 'Monitors', assigned: 38, available: 15, inRepair: 2 },
    { id: '3', name: 'Keyboards', assigned: 52, available: 18, inRepair: 4 },
    { id: '4', name: 'Headphones', assigned: 22, available: 12, inRepair: 3 },
    { id: '5', name: 'Accessories', assigned: 8, available: 11, inRepair: 2 },
];

const LOW_STOCK_ITEMS: LowStockItem[] = [
    { id: '1', name: 'MacBook Pro 16"', category: 'Laptops', currentStock: 3, minimumStock: 5, status: 'Critical' },
    { id: '2', name: 'Dell XPS 13', category: 'Laptops', currentStock: 4, minimumStock: 5, status: 'Warning' },
    { id: '3', name: 'Sony WH-1000XM5', category: 'Headphones', currentStock: 2, minimumStock: 8, status: 'Critical' },
    { id: '4', name: 'Mechanical RGB Keyboard', category: 'Keyboards', currentStock: 5, minimumStock: 10, status: 'Warning' },
];

const PENDING_OPERATION_REQUESTS: StockRequest[] = [
    {
        id: 'REQ-STK-001',
        itemName: 'MacBook Pro 16"',
        requestType: 'add-stock',
        requestedBy: 'Operation Team',
        requestedAt: '2026-04-15 09:40',
        status: 'Pending',
    },
    {
        id: 'REQ-STK-002',
        itemName: 'Mechanical RGB Keyboard',
        requestType: 'set-reorder-alert',
        requestedBy: 'Operation Team',
        requestedAt: '2026-04-15 10:12',
        status: 'Pending',
    },
];

function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Total Assets': return <Sigma  {...iconProps} />;
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

function CategoryCard({ category }: { category: AssetCategory }) {
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
    const getSeverityColor = (status: string) => {
        return status === 'Critical' ? '#ef4444' : '#f59e0b';
    };

    const shortage = item.minimumStock - item.currentStock;
    const shortagePercent = Math.round((shortage / item.minimumStock) * 100);

    return (
        <View className="p-3 rounded-lg mb-2" style={{ backgroundColor: getSeverityColor(item.status) + '10', borderLeftWidth: 4, borderLeftColor: getSeverityColor(item.status) }}>
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 flex-row items-center gap-2">
                    <AlertTriangle size={16} color={getSeverityColor(item.status)} strokeWidth={2} />
                    <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
                        <Text className="text-foreground/60 text-xs mt-1">{item.category}</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: getSeverityColor(item.status) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: getSeverityColor(item.status), fontSize: 11, fontWeight: '600' }}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-foreground/60 text-xs mb-1">Stock: {item.currentStock} / Min: {item.minimumStock}</Text>
                    <View className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{ backgroundColor: getSeverityColor(item.status), width: `${Math.min(100, (item.currentStock / item.minimumStock) * 100)}%` }}
                        />
                    </View>
                </View>
                <Text className="text-foreground/50 text-xs ml-3 min-w-12 text-right">{shortagePercent}% low</Text>
            </View>
        </View>
    );
}

export default function InventoryScreen() {
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const router = useRouter();
    const isOperationsMode = mode === 'operations';

    const handleStockActionRequest = (action: StockRequest['requestType']) => {
        router.push({
            pathname: '/dashboard',
            params: {
                openAddAsset: '1',
                stockAction: action,
            },
        });
    };

    const handleApprove = (requestId: string) => {
        Alert.alert('Approved', `Request ${requestId} approved by manager.`);
    };

    const handleReject = (requestId: string) => {
        Alert.alert('Rejected', `Request ${requestId} rejected by manager.`);
    };

    const getRequestTypeLabel = (type: StockRequest['requestType']) => {
        if (type === 'add-stock') return 'Add Stock';
        if (type === 'update-stock-level') return 'Update Stock Level';
        return 'Set Reorder Alert';
    };

    const quickActionPressStyle = ({ pressed }: PressableStateCallbackType) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
    });

    return (
        <ScrollView className="flex-1 bg-background " showsVerticalScrollIndicator={false}>
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

                {/* Stats Cards */}
                <FlatList
                    data={STATS}
                    keyExtractor={(item) => item.label}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => <MyCard item={item} />}
                    scrollEnabled={false}
                />

                {isOperationsMode && (
                    <Card className="bg-card border border-border rounded-xl ">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Quick Actions</CardTitle>
                            <CardDescription className="text-foreground/60">Requests go to manager for approval</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <View className="gap-3">
                                <Pressable
                                    onPress={() => handleStockActionRequest('add-stock')}
                                    className="w-full items-center rounded-lg bg-primary px-3 py-3"
                                    style={quickActionPressStyle}
                                >
                                    <Text className="text-white text-xs font-semibold">Add Stock</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleStockActionRequest('update-stock-level')}
                                    className="w-full items-center rounded-lg bg-primary px-3 py-3"
                                    style={quickActionPressStyle}
                                >
                                    <Text className="text-white text-xs font-semibold">Update Stock Level</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleStockActionRequest('set-reorder-alert')}
                                    className="w-full items-center rounded-lg bg-primary px-3 py-3"
                                    style={quickActionPressStyle}
                                >
                                    <Text className="text-white text-xs font-semibold">Set Reorder Alert</Text>
                                </Pressable>
                            </View>
                        </CardContent>
                    </Card>
                )}

                {!isOperationsMode && (
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Operation Requests</CardTitle>
                            <CardDescription className="text-foreground/60">Approve or reject pending stock requests</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-2">
                            {PENDING_OPERATION_REQUESTS.map((request) => (
                                <View key={request.id} className="rounded-lg border border-border p-3">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-sm font-semibold text-foreground">{request.itemName}</Text>
                                        <View className="rounded-full bg-amber-500/20 px-2 py-1">
                                            <Text className="text-[10px] font-bold text-amber-700">{request.status}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-xs text-foreground/70 mt-1">{getRequestTypeLabel(request.requestType)}</Text>
                                    <Text className="text-xs text-foreground/60">{request.requestedBy} • {request.requestedAt}</Text>
                                    <View className="flex-row gap-2 mt-3">
                                        <Pressable onPress={() => handleApprove(request.id)} className="rounded-md bg-emerald-600 px-3 py-1.5">
                                            <Text className="text-xs font-semibold text-white">Approve</Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleReject(request.id)} className="rounded-md bg-red-600 px-3 py-1.5">
                                            <Text className="text-xs font-semibold text-white">Reject</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Category-wise Assets */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Assets by Category</CardTitle>
                        <CardDescription className="text-foreground/60">View inventory status by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={ASSET_CATEGORIES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <CategoryCard category={item} />}
                            scrollEnabled={false}
                            contentContainerStyle={{ gap: 12 }}
                        />
                    </CardContent>
                </Card>

                {/* Low Stock Items */}
                <Card className="bg-card border border-destructive/30 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg flex-row items-center gap-2">
                            <AlertTriangle size={20} color="#ef4444" strokeWidth={2} />
                            <Text>Low Stock Items</Text>
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            {LOW_STOCK_ITEMS.length} items below minimum threshold
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={LOW_STOCK_ITEMS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <LowStockCard item={item} />}
                            scrollEnabled={false}
                        />
                    </CardContent>
                </Card>
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
