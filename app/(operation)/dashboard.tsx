import React from 'react';
import { View, ScrollView, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
    Activity,
    AlertTriangle,
    BadgeAlert,
    Briefcase,
    CalendarPlus,
    CheckCircle2,
    Clock,
    FileText,
    Gauge,
    Layers,
    ListTodo,
    MonitorCheck,
    Plus,
    Send,
    TrendingDown,
    TrendingUp,
    Undo2,
    Users2,
    Zap,
    Eye,
    Package,
    PlusIcon,
    ArrowBigLeft,
} from 'lucide-react-native';

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
    description: string;
    severity: 'Critical';
    timeStamp: string;
};

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
        description: 'Dell XPS Laptop requires approval for transfer to Building C',
        severity: 'Critical',
        timeStamp: '15 mins ago',
    },
    {
        id: '2',
        title: 'High-Value Equipment Under Review',
        description: '2 MacBook Pro units flagged for audit verification',
        severity: 'Critical',
        timeStamp: '32 mins ago',
    },
    {
        id: '3',
        title: 'Return Queue Processing Required',
        description: '5 devices awaiting final documentation and return confirmation',
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

function PendingActionItem({ action }: { action: PendingAction }) {
    return (
        <Pressable className="mb-3">
            <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-4">
                    <View className="flex-row items-start gap-3">
                        <View className="pt-1">
                            <AlertTriangle size={20} color="#ef4444" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="text-foreground font-semibold flex-1 mr-2">
                                    {action.title}
                                </Text>
                                <View className="bg-red-500 rounded-full px-2 py-1">
                                    <Text className="text-white text-xs font-bold">
                                        {action.severity}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-foreground/70 text-sm mb-2">
                                {action.description}
                            </Text>
                            <Text className="text-foreground/50 text-xs">
                                {action.timeStamp}
                            </Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </Pressable>
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
    return (
        <ScrollView
            className="flex-1 bg-background"
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

                {/* Pending Critical Actions */}
                <View className="mt-4">
                    <View className="flex-row items-center gap-2 mb-3">
                        <AlertTriangle size={20} color="#ef4444" />
                        <Text className="text-foreground text-lg font-bold">
                            Pending Critical Actions
                        </Text>
                    </View>
                    <FlatList
                        scrollEnabled={false}
                        data={PENDING_CRITICAL_ACTIONS}
                        renderItem={({ item }) => <PendingActionItem action={item} />}
                        keyExtractor={(item) => item.id}
                    />
                </View>

                {/* Quick Action Buttons */}
                <View className="mt-4">
                    <FlatList
                        scrollEnabled={false}
                        data={ACTIONS}
                        renderItem={({ item }) => <QuickActionButton item={item} />}
                        keyExtractor={(item) => item.label}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                    />
                </View>

                {/* Spacer for bottom tab bar */}
                <View style={{ height: 160 }} />
            </View>
        </ScrollView>
    );
}