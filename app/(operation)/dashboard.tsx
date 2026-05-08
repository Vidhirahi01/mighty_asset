import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Text } from '@/components/ui/text';
import {
    AlertTriangle,
    BadgeAlert,
    CalendarPlus,
    Layers,
    ListTodo,
    MonitorCheck,
    Undo2,
    Eye,
    PlusIcon,
    ArrowBigLeft,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RightDrawer } from '@/components/RightDrawer';
import { AddAssetForm } from '@/components/Assets/AddAssetForm';
import { useAssets } from '@/hooks/queries/useAssets';
import { useOperationsAssignmentRequests } from '@/hooks/queries/useRequests';
import { useReturnRequests } from '@/hooks/queries/useReturnRequests';

type StatItem = {
    label: string;
    count: number;
};
type actions = {
    label: string;
};
type PendingAction = {
    id: string;
    title: string;
    product_id: string;
    reportedBy: string;
    actionType: 'assign' | 'return';
    actionId: string;
    severity: 'Critical';
    timeStamp: string;
};

type StockActionMode = 'add-stock' | 'set-reorder-alert';


const ACTIONS: actions[] = [

    { label: 'Add Asset' },
    { label: 'Assign Asset' },
    { label: 'View all' },
    { label: 'Inventory' },
]
const relativeTime = (value: string) => {
    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return 'Unknown time';
    const diff = Math.max(1, Math.floor((Date.now() - ts) / (1000 * 60)));
    if (diff < 60) return `${diff} min ago`;
    const hr = Math.floor(diff / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? 's' : ''} ago`;
};
function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Total Assets': return <Layers {...iconProps} />;
            case 'Available': return <ListTodo {...iconProps} />;
            case 'pending issues': return <BadgeAlert {...iconProps} />;
            case 'Return Queue': return <Undo2 {...iconProps} />;
            case 'Active issue': return <MonitorCheck {...iconProps} />;
            case 'Today Assigns': return <CalendarPlus {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="mx-2 my-2 flex-1 bg-primary border border-primary shadow-lg">
            <CardContent className="items-center justify-center">
                <View className="rounded-full bg-white/20">
                    {getIcon(item.label)}
                </View>
                <Text className="text-white text-xs text-center opacity-90">{item.label}</Text>
                <Text className="mt-3 text-white text-4xl font-bold text-center">{item.count}</Text>
            </CardContent>
        </Card>
    );
}

function PendingActionItem({ action, onPress }: { action: PendingAction; onPress?: () => void }) {
    const getActionLabel = (type: string) => {
        return type === 'assign' ? 'Assign ID' : 'Return ID';
    };

    const getActionIdLabel = (type: string, id: string) => {
        return type === 'assign' ? `ASSIGN: ${id}` : `RETURN: ${id}`;
    };

    return (
        <View>
            <Pressable onPress={onPress} className="py-3">
                <View className="flex-row items-start justify-between px-4">
                    <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm mb-1">
                            {action.title}
                        </Text>
                        <View className="gap-1">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-foreground/70 text-xs">Product ID:</Text>
                                <Text className="text-foreground font-medium text-xs">
                                    {action.product_id}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-foreground/70 text-xs">Reported by:</Text>
                                <Text className="text-foreground font-medium text-xs">
                                    {action.reportedBy}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-foreground/70 text-xs">
                                    {getActionLabel(action.actionType)}
                                </Text>
                                <Text className="text-blue-600 font-semibold text-xs">
                                    {getActionIdLabel(action.actionType, action.actionId)}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-foreground/50 text-xs mt-2">
                            {action.timeStamp}
                        </Text>
                    </View>
                    <View className="bg-red-500 rounded-full px-2.5 py-1 ml-2">
                        <Text className="text-white text-xs font-bold">
                            {action.severity}
                        </Text>
                    </View>
                </View>
            </Pressable>
            <Separator className="bg-border" />
        </View>
    );
}

function QuickActionButton({ onPress, item }: { item: actions; onPress?: () => void }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Add Asset': return <PlusIcon {...iconProps} />;
            case 'Assign Asset': return <ArrowBigLeft {...iconProps} />;
            case 'View all': return <Eye {...iconProps} />;
            case 'Inventory': return <Layers {...iconProps} />;
            default: return null;
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, margin: 8 }}>
            <Card className="bg-primary border border-primary shadow-lg w-full h-40 items-center justify-center">
                <CardContent className="w-full h-full items-center justify-center">
                    <View className="rounded-full bg-white/20 p-3 mb-2">
                        {getIcon(item.label)}
                    </View>
                    <Text className="text-white text-sm text-center font-semibold px-2">
                        {item.label}
                    </Text>
                </CardContent>
            </Card>
        </TouchableOpacity>
    );
}

export default function OperationDashboard() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [stockActionMode, setStockActionMode] = useState<StockActionMode | undefined>(undefined);
    const [openedFromInventory, setOpenedFromInventory] = useState(false);
    const router = useRouter();

    const { data: rawAssets = [], error: assetsError } = useAssets();
    const { data: assignmentQueue = [] } = useOperationsAssignmentRequests();
    const { data: returnRequests = [] } = useReturnRequests();
    const { openAddAsset, stockAction } = useLocalSearchParams<{ openAddAsset?: string; stockAction?: StockActionMode }>();
    const stats = React.useMemo(() => {
        const total = rawAssets.length;

        const available = rawAssets.filter(
            (a) => a.status === "AVAILABLE"
        ).length;

        const assigned = rawAssets.filter(
            (a) => a.status === "ASSIGNED"
        ).length;

        const returnQueue = rawAssets.filter(
            (a) => a.status === "RETURN_PENDING"
        ).length;

        return [
            { label: "Total Assets", count: total },
            { label: "Available", count: available },
            { label: "Assigned", count: assigned },
            { label: "Return Queue", count: returnQueue },
        ];
    }, [rawAssets]);
    useEffect(() => {
        if (openAddAsset === '1') {
            setStockActionMode(stockAction);
            setOpenedFromInventory(true);
            setIsDrawerOpen(true);
            router.setParams({ openAddAsset: undefined, stockAction: undefined });
        }
    }, [openAddAsset, router, stockAction]);

    const pendingActions = React.useMemo<PendingAction[]>(() => {
        const assignmentActions = assignmentQueue.map((item) => {
            const status = String(item.status ?? '').toUpperCase();
            const isPurchase = status === 'PURCHASE_PENDING';
            const title = isPurchase
                ? 'Purchase Request Pending'
                : 'Asset Assignment Required';

            return {
                id: item.id,
                title,
                product_id: item.category ?? 'Uncategorized',
                reportedBy: item.requester_name || item.email || 'Unknown',
                actionType: 'assign',
                actionId: item.id,
                severity: 'Critical',
                timeStamp: relativeTime(item.created_at),
            } satisfies PendingAction;
        });

        const returnActions = returnRequests
            .filter((item) => String(item.type ?? '').toLowerCase() === 'return-asset')
            .filter((item) => String(item.status ?? '').toUpperCase() !== 'APPROVED')
            .map((item) => ({
                id: item.id,
                title: 'Return Request Pending',
                product_id: item.asset_name || item.asset_id || item.category || 'Unknown Asset',
                reportedBy: item.email || 'Unknown',
                actionType: 'return',
                actionId: item.id,
                severity: 'Critical',
                timeStamp: relativeTime(item.created_at),
            } satisfies PendingAction));

        return [...assignmentActions, ...returnActions];
    }, [assignmentQueue, returnRequests]);

    const handleQuickActionPress = (label: string) => {
        switch (label) {
            case 'Add Asset':
                setOpenedFromInventory(false);
                setStockActionMode(undefined);
                setIsDrawerOpen(true);
                break;
            case 'Assign Asset':
                router.push('/assign-asset');
                break;
            case 'View all':
                router.push('/asset-category');
                break;
            case 'Inventory':
                router.push({ pathname: './inventory', params: { mode: 'operations' } });
                break;
            default:
                break;
        }
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-6 gap-4">
                    <View className="gap-1 mb-2">
                        <Text className="text-foreground text-2xl font-bold">Operations Dashboard</Text>
                        <Text className="text-foreground/60 text-sm">Monitor and manage daily operations</Text>
                    </View>

                    <View className="gap-2">
                        <View className="flex-row flex-wrap">
                            {stats.map((item) => (
                                <View key={item.label} style={{ width: '50%' }}>
                                    <MyCard item={item} />
                                </View>
                            ))}
                        </View>
                    </View>

                    <Card className="bg-card border border-border mt-4">
                        <CardHeader>
                            <View className="flex-row items-center gap-2">
                                <AlertTriangle size={20} color="#ef4444" />
                                <View className="flex-1">
                                    <CardTitle className="text-foreground text-lg">
                                        Pending Critical Actions
                                    </CardTitle>
                                    <CardDescription className="text-foreground/60">
                                        {pendingActions.length} actions require attention
                                    </CardDescription>
                                </View>
                            </View>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingActions.length === 0 ? (
                                <View className="px-4 py-6">
                                    <Text className="text-foreground/60 text-sm">No pending critical actions.</Text>
                                </View>
                            ) : (
                                pendingActions.map((item) => (
                                    <PendingActionItem key={item.id} action={item} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <View className="mt-4">
                        <View className="flex-row flex-wrap">
                            {ACTIONS.map((item) => (
                                <View key={item.label} style={{ width: '50%' }}>
                                    <QuickActionButton
                                        item={item}
                                        onPress={() => handleQuickActionPress(item.label)}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 160 }} />
                </View>
            </ScrollView>

            <RightDrawer visible={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <AddAssetForm
                    onClose={() => setIsDrawerOpen(false)}
                    presetAction={stockActionMode}
                    forceClassicAddForm={!openedFromInventory && !stockActionMode}
                />
            </RightDrawer>
        </View>
    );
}