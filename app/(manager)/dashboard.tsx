import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { BarChart3, Users, CheckSquare, GitPullRequest, GitPullRequestArrow, CheckCheck, BadgeAlert, Bug, Check, X, Clock, Laptop, Monitor, Keyboard, Headphones, Package, AlertTriangle, TrendingDown } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';

type StatItem = {
    label: string;
    count: number;
};

type ApprovalRequest = {
    id: string;
    userName: string;
    assetName: string;
    priority: 'High' | 'Medium' | 'Low';
    submittedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
};

type AssetCategory = {
    id: string;
    name: string;
    icon: any;
    count: number;
};

type Asset = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    status: 'Available' | 'In Use' | 'Maintenance';
};

type InventoryAlert = {
    id: string;
    assetName: string;
    category: string;
    currentQuantity: number;
    minimumThreshold: number;
    severity: 'Critical' | 'Warning';
    lastOrdered?: string;
};

const STATS: StatItem[] = [
    { label: 'Pending Requests', count: 8 },
    { label: 'Currently Assigned', count: 47 },
    { label: 'Open Issues', count: 3 },
    { label: 'Low Stock Item', count: 5 },
];

const PENDING_APPROVALS: ApprovalRequest[] = [
    {
        id: '1',
        userName: 'John Smith',
        assetName: 'Laptop Dell XPS 13',
        priority: 'High',
        submittedAt: '2 hours ago',
        status: 'Pending',
    },
    {
        id: '2',
        userName: 'Sarah Johnson',
        assetName: 'Monitor LG 27"',
        priority: 'Medium',
        submittedAt: '5 hours ago',
        status: 'Pending',
    },
    {
        id: '3',
        userName: 'Mike Davis',
        assetName: 'Keyboard Mechanical RGB',
        priority: 'Low',
        submittedAt: '1 day ago',
        status: 'Pending',
    },
    {
        id: '4',
        userName: 'Emma Wilson',
        assetName: 'USB-C Hub',
        priority: 'Medium',
        submittedAt: '3 hours ago',
        status: 'Pending',
    },
];

const ASSET_CATEGORIES: AssetCategory[] = [
    { id: '1', name: 'Laptops', icon: Laptop, count: 24 },
    { id: '2', name: 'Monitors', icon: Monitor, count: 18 },
    { id: '3', name: 'Keyboards', icon: Keyboard, count: 32 },
    { id: '4', name: 'Headphones', icon: Headphones, count: 15 },
    { id: '5', name: 'Accessories', icon: Package, count: 48 },
];

const ASSETS: Asset[] = [
    { id: '1', name: 'Dell XPS 13', category: 'Laptops', quantity: 5, status: 'Available' },
    { id: '2', name: 'MacBook Pro 16"', category: 'Laptops', quantity: 3, status: 'In Use' },
    { id: '3', name: 'LG 27" 4K Monitor', category: 'Monitors', quantity: 8, status: 'Available' },
    { id: '4', name: 'Dell 24" Monitor', category: 'Monitors', quantity: 10, status: 'Available' },
    { id: '5', name: 'Mechanical RGB Keyboard', category: 'Keyboards', quantity: 12, status: 'In Use' },
    { id: '6', name: 'Wireless Keyboard', category: 'Keyboards', quantity: 20, status: 'Available' },
    { id: '7', name: 'Sony WH-1000XM5', category: 'Headphones', quantity: 4, status: 'Available' },
    { id: '8', name: 'Bose QC45', category: 'Headphones', quantity: 11, status: 'In Use' },
    { id: '9', name: 'USB-C Hub', category: 'Accessories', quantity: 15, status: 'Available' },
    { id: '10', name: 'USB-A to USB-C Cable', category: 'Accessories', quantity: 33, status: 'Available' },
];

const INVENTORY_ALERTS: InventoryAlert[] = [
    {
        id: '1',
        assetName: 'MacBook Pro 16"',
        category: 'Laptops',
        currentQuantity: 3,
        minimumThreshold: 5,
        severity: 'Critical',
        lastOrdered: '3 days ago',
    },
    {
        id: '2',
        assetName: 'Sony WH-1000XM5',
        category: 'Headphones',
        currentQuantity: 4,
        minimumThreshold: 8,
        severity: 'Critical',
        lastOrdered: '1 week ago',
    },
    {
        id: '3',
        assetName: 'Mechanical RGB Keyboard',
        category: 'Keyboards',
        currentQuantity: 12,
        minimumThreshold: 15,
        severity: 'Warning',
        lastOrdered: '2 weeks ago',
    },
    {
        id: '4',
        assetName: 'Dell 24" Monitor',
        category: 'Monitors',
        currentQuantity: 10,
        minimumThreshold: 12,
        severity: 'Warning',
        lastOrdered: '5 days ago',
    },
];

function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Pending Requests': return <GitPullRequestArrow {...iconProps} />;
            case 'Currently Assigned': return <CheckCheck {...iconProps} />;
            case 'Open Issues': return <Bug {...iconProps} />;
            case 'Low Stock Item': return <BadgeAlert {...iconProps} />;
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

function ApprovalRequestRow({ item, onPress }: { item: ApprovalRequest; onPress: () => void }) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <Check size={16} color="#22c55e" strokeWidth={3} />;
            case 'Rejected': return <X size={16} color="#ef4444" strokeWidth={3} />;
            case 'Pending': return <Clock size={16} color="#f59e0b" strokeWidth={2} />;
            default: return null;
        }
    };

    return (
        <Pressable onPress={onPress}>
            <View className="bg-primary-50 border border-border/50 rounded-lg p-3 mb-2 active:opacity-70">
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{item.userName}</Text>
                        <Text className="text-foreground/60 text-xs mt-1">{item.assetName}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View style={{ backgroundColor: getPriorityColor(item.priority) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ color: getPriorityColor(item.priority), fontSize: 11, fontWeight: '600' }}>
                                {item.priority}
                            </Text>
                        </View>
                        {getStatusIcon(item.status)}
                    </View>
                </View>
                <Text className="text-foreground/50 text-xs">{item.submittedAt}</Text>
            </View>
        </Pressable>
    );
}

function CategoryPill({ category, isActive, onPress }: { category: AssetCategory; isActive?: boolean; onPress?: () => void }) {
    const IconComponent = category.icon;
    return (
        <Pressable onPress={onPress}>
            <View className={`flex-row items-center gap-2 px-4 py-3 rounded-full mr-3 border ${isActive ? 'bg-primary border-primary' : 'bg-card border-border/50'}`}>
                <IconComponent size={18} color={isActive ? '#ffffff' : '#6b7280'} strokeWidth={2} />
                <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-foreground/70'}`}>
                    {category.name}
                </Text>
                <Text className={`text-xs font-bold ${isActive ? 'text-white/80' : 'text-foreground/50'}`}>
                    {category.count}
                </Text>
            </View>
        </Pressable>
    );
}

function AssetRow({ asset }: { asset: Asset }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return '#22c55e';
            case 'In Use': return '#3b82f6';
            case 'Maintenance': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <View className="flex-row items-center justify-between p-3 border-b border-border/50">
            <View className="flex-1">
                <Text className="text-foreground font-semibold text-sm">{asset.name}</Text>
                <Text className="text-foreground/60 text-xs mt-1">{asset.category}</Text>
            </View>
            <View className="flex-row items-center gap-3">
                <View className="items-center">
                    <Text className="text-foreground font-bold text-base">{asset.quantity}</Text>
                    <Text className="text-foreground/50 text-xs">qty</Text>
                </View>
                <View style={{ backgroundColor: getStatusColor(asset.status) + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: getStatusColor(asset.status), fontSize: 11, fontWeight: '600' }}>
                        {asset.status}
                    </Text>
                </View>
            </View>
        </View>
    );
}

function InventoryAlertRow({ alert }: { alert: InventoryAlert }) {
    const getSeverityColor = (severity: string) => {
        return severity === 'Critical' ? '#ef4444' : '#f59e0b';
    };

    const getAlertIcon = (severity: string) => {
        return severity === 'Critical'
            ? <AlertTriangle size={16} color="#ef4444" strokeWidth={2} />
            : <TrendingDown size={16} color="#f59e0b" strokeWidth={2} />;
    };

    const shortagePercent = Math.round(
        ((alert.minimumThreshold - alert.currentQuantity) / alert.minimumThreshold) * 100
    );

    return (
        <View className="p-4 rounded-lg mb-2" style={{ backgroundColor: getSeverityColor(alert.severity) + '10', borderLeftWidth: 4, borderLeftColor: getSeverityColor(alert.severity) }}>
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 flex-row items-center gap-2">
                    {getAlertIcon(alert.severity)}
                    <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{alert.assetName}</Text>
                        <Text className="text-foreground/60 text-xs mt-1">{alert.category}</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: getSeverityColor(alert.severity) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: getSeverityColor(alert.severity), fontSize: 11, fontWeight: '600' }}>
                        {alert.severity}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-foreground/60 text-xs mb-1">Current: {alert.currentQuantity} | Minimum: {alert.minimumThreshold}</Text>
                    <View className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{ backgroundColor: getSeverityColor(alert.severity), width: `${Math.min(100, (alert.currentQuantity / alert.minimumThreshold) * 100)}%` }}
                        />
                    </View>
                </View>
                <Text className="text-foreground/50 text-xs ml-3 min-w-12 text-right">{shortagePercent}% low</Text>
            </View>
            {alert.lastOrdered && (
                <Text className="text-foreground/50 text-xs mt-2">Last ordered: {alert.lastOrdered}</Text>
            )}
        </View>
    );
}

export default function ManagerDashboard() {
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

    const filteredAssets = activeCategory
        ? ASSETS.filter(asset => asset.category === activeCategory)
        : ASSETS;

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <FlatList
                    data={STATS}
                    keyExtractor={(item) => item.label}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => <MyCard item={item} />}
                    scrollEnabled={false}
                />

                {/* Pending Approvals */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Pending Approvals</CardTitle>
                        <CardDescription className="text-foreground/60">Review and approve asset requests from team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={PENDING_APPROVALS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ApprovalRequestRow
                                    item={item}
                                    onPress={() => {
                                        // Navigate to approval details page with full information
                                        console.log('Navigate to approval details:', item.id);
                                    }}
                                />
                            )}
                            scrollEnabled={false}
                        />
                    </CardContent>
                </Card>

                {/* Asset Categories */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Asset Categories</CardTitle>
                        <CardDescription className="text-foreground/60">Browse by asset type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={ASSET_CATEGORIES}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <CategoryPill
                                    category={item}
                                    isActive={activeCategory === item.name}
                                    onPress={() => setActiveCategory(activeCategory === item.name ? null : item.name)}
                                />
                            )}
                            scrollEnabled={true}
                        />
                    </CardContent>
                </Card>

                {/* Asset Summary List */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">
                            {activeCategory ? `${activeCategory}` : 'All Assets'}
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            {filteredAssets.length} {activeCategory ? 'asset' : 'assets'} {activeCategory ? 'in this category' : 'total'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={filteredAssets}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <AssetRow asset={item} />}
                            scrollEnabled={false}
                        />
                    </CardContent>
                </Card>

                {/* Inventory Alerts */}
                <Card className="bg-card border border-destructive/30 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg flex-row items-center ">
                            <AlertTriangle size={20} color="#ef4444" strokeWidth={2} />
                            <View className='w-2'/>                            
                            <Text >Inventory Alerts</Text>
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            {INVENTORY_ALERTS.length} items below minimum stock threshold
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={INVENTORY_ALERTS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <InventoryAlertRow alert={item} />}
                            scrollEnabled={false}
                        />
                    </CardContent>
                </Card>
            </View>
        </ScrollView>
    );
}
