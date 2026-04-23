import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { GitPullRequestArrow, CheckCheck, BadgeAlert, Bug, Check, X, Clock, Laptop, Monitor, Keyboard, Headphones, Package, AlertTriangle, TrendingDown } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAssets } from '@/hooks/queries/useAssets';
import { useManagerRequests, useRequestSummary } from '@/hooks/queries/useRequests';

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



const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeAssetStatus = (value: string | null | undefined): Asset['status'] => {
    const status = (value ?? '').toLowerCase().replace(/[_\s-]/g, '');
    if (status === 'available') return 'Available';
    if (status === 'assigned' || status === 'inuse') return 'In Use';
    return 'Maintenance';
};

const getPriorityFromReason = (reason: string | null): ApprovalRequest['priority'] => {
    const line = (reason ?? '').split('\n').find((item) => item.startsWith('Priority: '));
    const priority = line?.replace('Priority: ', '').trim().toLowerCase();
    if (priority === 'high') return 'High';
    if (priority === 'low') return 'Low';
    return 'Medium';
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

const getCategoryIcon = (value: string) => {
    const category = value.toLowerCase();
    if (category.includes('laptop')) return Laptop;
    if (category.includes('monitor')) return Monitor;
    if (category.includes('keyboard')) return Keyboard;
    if (category.includes('headphone')) return Headphones;
    return Package;
};

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
      const [selectedCategory, setSelectedCategory] = React.useState('All');

  const { data: assets, isLoading } = useAssets(selectedCategory);
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
    const { data: assetsData = [], error: assetsError } = useAssets(selectedCategory);
    const { data: managerRequests = [], error: requestsError } = useManagerRequests();
    const { data: requestSummary } = useRequestSummary();

    const assets: Asset[] = assetsData.map((row) => ({
        id: String(row.id),
        name: row.asset_name || 'Unnamed Asset',
        category: toTitle(row.category || 'uncategorized'),
        quantity: Number(row.quantity ?? 0),
        status: normalizeAssetStatus(row.status),
    }));

    const pendingApprovalsFromDb: ApprovalRequest[] = managerRequests
        .filter((row) => String(row.status).toUpperCase() === 'PENDING')
        .slice(0, 6)
        .map((row) => ({
            id: row.id,
            userName: row.requester_name || (row.email?.split('@')[0] || 'Employee').replace(/\./g, ' '),
            assetName: `${toTitle(row.category || 'asset')}${row.quantity ? ` x${row.quantity}` : ''}`,
            priority: getPriorityFromReason(row.reason),
            submittedAt: getRelativeTime(row.created_at),
            status: 'Pending',
        }));

    const pendingApprovals = pendingApprovalsFromDb;

 const { data: assets, isLoading } = useAssets(selectedCategory);

const data = assets ?? [];
    const categoryCountMap = safeAssets.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1;
        return acc;
    }, {});

    const assetCategories: AssetCategory[] = Object.entries(categoryCountMap)
        .map(([name, count], index) => ({
            id: `${index + 1}`,
            name,
            icon: getCategoryIcon(name),
            count,
        }))
        .sort((a, b) => b.count - a.count);

    const inventoryAlertsFromDb: InventoryAlert[] = assetsData
        .filter((row) => {
            const qty = Number(row.quantity ?? 0);
            const min = Number(row.minimum_stock_level ?? 0);
            return min > 0 && qty < min;
        })
        .map((row) => {
            const qty = Number(row.quantity ?? 0);
            const min = Number(row.minimum_stock_level ?? 0);
            return {
                id: String(row.id),
                assetName: row.asset_name || 'Unnamed Asset',
                category: toTitle(row.category || 'uncategorized'),
                currentQuantity: qty,
                minimumThreshold: min,
                severity: qty <= Math.floor(min / 2) ? 'Critical' : 'Warning',
            } as InventoryAlert;
        })
        .sort((a, b) => a.currentQuantity - b.currentQuantity);

    const inventoryAlerts: InventoryAlert[] = inventoryAlertsFromDb;

    const stats: StatItem[] = [
        { label: 'Pending Requests', count: requestSummary?.pendingApprovals ?? pendingApprovals.length },
        { label: 'Currently Assigned', count: safeAssets.filter((item) => item.status === 'In Use').length },
        { label: 'Open Issues', count: requestSummary?.openIssues ?? 0 },
        { label: 'Low Stock Item', count: inventoryAlerts.length },
    ];

    const filteredAssets = activeCategory
        ? safeAssets.filter(asset => asset.category === activeCategory)
        : safeAssets;

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {assetsError || requestsError ? (
                    <Text className="text-sm text-destructive">
                        Live dashboard data could not be loaded from DB. Showing fallback values.
                    </Text>
                ) : null}
                <FlatList
                    data={stats}
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
                            data={pendingApprovals}
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
                            ListEmptyComponent={<Text className="text-foreground/60 text-sm">No pending approvals.</Text>}
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
                            data={assetCategories}
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
                            ListEmptyComponent={<Text className="text-foreground/60 text-sm">No assets available.</Text>}
                        />
                    </CardContent>
                </Card>

                {/* Inventory Alerts */}
                <Card className="bg-card border border-destructive/30 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg flex-row items-center ">
                            <AlertTriangle size={20} color="#ef4444" strokeWidth={2} />
                            <View className='w-2' />
                            <Text >Inventory Alerts</Text>
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            {inventoryAlerts.length} items below minimum stock threshold
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={inventoryAlerts}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <InventoryAlertRow alert={item} />}
                            scrollEnabled={false}
                            ListEmptyComponent={<Text className="text-foreground/60 text-sm">No inventory alerts.</Text>}
                        />
                    </CardContent>
                </Card>
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
