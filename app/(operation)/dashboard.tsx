
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

type StockActionMode = 'add-stock' | 'update-stock-level' | 'set-reorder-alert';

const STATS: StatItem[] = [
    { label: 'Total Assets', count: 257 },
    { label: 'Available', count: 142 },
    { label: 'pending issues', count: 4 },
    { label: 'Return Queue', count: 3 },
    { label: 'Active issue', count: 257 },
    { label: 'Today Assigns', count: 3 },
];

const ACTIONS: actions[] = [

    { label: 'Add Asset' },
    { label: 'Assign Asset' },
    { label: 'View all' },
    { label: 'Inventory' },
]
const PENDING_CRITICAL_ACTIONS: PendingAction[] = [
    {
        id: '1',
        title: 'Asset Movement Authorization Pending',
        product_id: 'PROD-001',
        reportedBy: 'John Doe',
        actionType: 'assign',
        actionId: 'ASSIGN-001',
        severity: 'Critical',
        timeStamp: '15 mins ago',
    },
    {
        id: '2',
        title: 'High-Value Equipment Under Review',
        product_id: 'PROD-002',
        reportedBy: 'Sarah Johnson',
        actionType: 'return',
        actionId: 'RETURN-001',
        severity: 'Critical',
        timeStamp: '32 mins ago',
    },
    {
        id: '3',
        title: 'Return Queue Processing Required',
        product_id: 'PROD-003',
        reportedBy: 'Mike Wilson',
        actionType: 'return',
        actionId: 'RETURN-002',
        severity: 'Critical',
        timeStamp: '1 hour ago',
    },
];
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
    const router = useRouter();
    const { openAddAsset, stockAction } = useLocalSearchParams<{ openAddAsset?: string; stockAction?: StockActionMode }>();

    useEffect(() => {
        if (openAddAsset === '1') {
            setStockActionMode(stockAction);
            setIsDrawerOpen(true);
            router.setParams({ openAddAsset: undefined, stockAction: undefined });
        }
    }, [openAddAsset, router, stockAction]);

    const handleQuickActionPress = (label: string) => {
        switch (label) {
            case 'Add Asset':
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
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="p-6 gap-4">
                    {/* Header */}
                    <View className="gap-1 mb-2">
                        <Text className="text-foreground text-2xl font-bold">Operations Dashboard</Text>
                        <Text className="text-foreground/60 text-sm">Monitor and manage daily operations</Text>
                    </View>

                    {/* Stats Grid */}
                    <View className="gap-2">
                        <View className="flex-row gap-2">
                            <FlatList
                                scrollEnabled={false}
                                data={STATS}
                                renderItem={({ item }) => <MyCard item={item} />}
                                keyExtractor={(item) => item.label}
                                numColumns={2}
                                columnWrapperStyle={{ gap: 8 }}
                            />
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
                                        {PENDING_CRITICAL_ACTIONS.length} actions require attention
                                    </CardDescription>
                                </View>
                            </View>
                        </CardHeader>
                        <CardContent className="p-0">
                            <FlatList
                                scrollEnabled={false}
                                data={PENDING_CRITICAL_ACTIONS}
                                renderItem={({ item }) => <PendingActionItem action={item} />}
                                keyExtractor={(item) => item.id}
                            />
                        </CardContent>
                    </Card>

                    <View className="mt-4">
                        <FlatList
                            scrollEnabled={false}
                            data={ACTIONS}
                            renderItem={({ item }) => (
                                <QuickActionButton
                                    item={item}
                                    onPress={() => handleQuickActionPress(item.label)}
                                />
                            )}
                            keyExtractor={(item) => item.label}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                        />
                    </View>

                    <View style={{ height: 160 }} />
                </View>
            </ScrollView>

            {/* Add Asset Drawer */}
            <RightDrawer visible={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <AddAssetForm
                    onClose={() => setIsDrawerOpen(false)}
                    presetAction={stockActionMode}
                />
            </RightDrawer>
        </View>
    );
}