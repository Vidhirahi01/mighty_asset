import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    BellRing, TriangleAlert, Users2, Settings, History,
    UserCheck, Shield, Briefcase, Wrench, Crown, Clock, CheckCircle2,
    FileText, RotateCcw, TrendingUp
} from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native';
import { useAssets } from '@/hooks/queries/useAssets';
import { useOperationsIssues } from '@/hooks/queries/useIssues';
import { useManagerRequests } from '@/hooks/queries/useRequests';
import { useUsers } from '@/hooks/queries/useUsers';

type StatItem = {
    label: string;
    count: number;
};

type UsersByRoleItem = {
    role: string;
    count: number;
};
type ActivityItem = {
    req: string;
    count: number;
}
type QuickAction = {
    Label: string;
    description: string;
}
const ACTIONS: QuickAction[] = [
    { Label: 'Manager Users', description: 'Create, edit, or remove users' },
    { Label: 'System Setting', description: 'Configure system parameters' },
    { Label: 'Audit Logs', description: 'View system Activity logs' },

];
type Notifys = {
    Label: string;
    description: string;
}
function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Total Users': return <Users2 {...iconProps} />;
            case 'Active Users': return <TrendingUp {...iconProps} />;
            case 'Total Assets': return <Briefcase {...iconProps} />;
            case 'Total Requests': return <FileText {...iconProps} />;
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

function ListUsers({ usersByRole }: { usersByRole: UsersByRoleItem[] }) {
    const getRoleIcon = (role: string) => {
        const iconProps = { size: 18, strokeWidth: 2 };
        switch (role) {
            case 'Employees': return <Briefcase color="#1b72fc" {...iconProps} />;
            case 'Manager': return <Shield color="#8b5cf6" {...iconProps} />;
            case 'Operation Team': return <Users2 color="#ec4899" {...iconProps} />;
            case 'Technicians': return <Wrench color="#14b8a6" {...iconProps} />;
            case 'Administrators': return <Crown color="#f59e0b" {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="p-0 mx-3 mt-3 bg-card border border-border shadow-md">
            <CardHeader className="pt-5">
                <View className="flex-row items-center">
                    <Users2 color="#1b72fc" size={20} />
                    <CardTitle className="text-foreground font-bold text-lg ml-2">Users by Role</CardTitle>
                </View>
            </CardHeader>
            <CardContent className="p-0">
                <FlatList
                    data={usersByRole}
                    keyExtractor={(item) => item.role}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                        <>
                            <View className="flex-row justify-between items-center px-6 py-4">
                                <View className="flex-row items-center flex-1">
                                    {getRoleIcon(item.role)}
                                    <Text className="text-foreground font-medium ml-3">{item.role}</Text>
                                </View>
                                <View className="bg-primary/15 px-3 py-1.5 rounded-full">
                                    <Text className="text-primary font-bold text-sm">{item.count}</Text>
                                </View>
                            </View>
                            {index < usersByRole.length - 1 && <Separator className="bg-border" />}
                        </>
                    )}
                />
            </CardContent>
        </Card>
    );
}
function SystemActivity({ item }: { item: ActivityItem }) {
    const getActivityIcon = (req: string) => {
        const iconProps = { size: 18, strokeWidth: 2 };
        switch (req) {
            case 'Pending Requests': return <FileText color="#1b72fc" {...iconProps} />;
            case 'Approved Requests': return <CheckCircle2 color="#10b981" {...iconProps} />;
            case 'Assigned Assets': return <UserCheck color="#8b5cf6" {...iconProps} />;
            case 'Return Queue': return <RotateCcw color="#ef4444" {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="mx-1 my-1 flex-1 bg-primary-200 border border-border shadow-md">
            <CardContent className="px-3 py-4 items-center justify-center">
                <View className="mb-2">
                    {getActivityIcon(item.req)}
                </View>
                <Text className="text-foreground text-2xl font-bold">{item.count}</Text>
                <Text className="text-foreground text-xs mt-1 text-center opacity-75">{item.req}</Text>
            </CardContent>
        </Card>
    );
}

function QuickActions({ item, onPress }: { item: QuickAction; onPress: () => void }) {
    const getActionIcon = (label: string) => {
        const iconProps = { size: 20, strokeWidth: 2, color: '#1b72fc' };
        switch (label) {
            case 'Manager Users': return <Users2 {...iconProps} />;
            case 'System Setting': return <Settings {...iconProps} />;
            case 'Audit Logs': return <History {...iconProps} />;
            default: return null;
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.4} onPress={onPress} className="w-full my-2">
            <Card className="w-full bg-card border border-primary/20 shadow-md">
                <CardContent className="px-4 py-4">
                    <View className="flex-row items-start">
                        <View className="bg-primary/10 p-2 rounded-lg mr-3">
                            {getActionIcon(item.Label)}
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-lg font-bold">{item.Label}</Text>
                            <Text className="text-foreground text-xs mt-1 opacity-75">{item.description}</Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </TouchableOpacity>
    );
}

function AlertsNotifys({ item }: { item: Notifys }) {
    return (
        <Card className="w-full bg-accent-100 my-1 border border-border shadow-sm">
            <CardContent className="px-4 py-3">
                <View className="flex-row items-start">
                    <TriangleAlert color='#ca0f0f' size={18} strokeWidth={2} />
                    <View className="flex-1 ml-3">
                        <Text className="text-foreground text-base font-bold">{item.Label}</Text>
                        <Text className="text-foreground text-xs mt-1 opacity-75">{item.description}</Text>
                    </View>
                </View>
            </CardContent>
        </Card>
    );
}
export default function Dashboard() {
    const handleQuickActionPress = (action: QuickAction) => {
        // Add navigation or action logic here per quick action.
        console.log(`Quick action pressed: ${action.Label}`);
    };

    const { data: users = [] } = useUsers();
    const { data: assets = [] } = useAssets();
    const { data: requests = [] } = useManagerRequests();
    const { data: issues = [] } = useOperationsIssues();

    const stats: StatItem[] = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter((user) => user.is_active).length;
        const totalAssets = assets.length;
        const totalRequests = requests.length;

        return [
            { label: 'Total Users', count: totalUsers },
            { label: 'Active Users', count: activeUsers },
            { label: 'Total Assets', count: totalAssets },
            { label: 'Total Requests', count: totalRequests },
        ];
    }, [users, assets, requests]);

    const usersByRole: UsersByRoleItem[] = useMemo(() => {
        const roleLabels = [
            { key: 'EMPLOYEE', label: 'Employees' },
            { key: 'MANAGER', label: 'Manager' },
            { key: 'OPERATION', label: 'Operation Team' },
            { key: 'TECHNICIAN', label: 'Technicians' },
            { key: 'ADMIN', label: 'Administrators' },
        ];

        const counts = new Map(roleLabels.map((item) => [item.label, 0]));

        users.forEach((user) => {
            const role = String(user.role ?? '').trim().toUpperCase();
            const match = roleLabels.find((item) => item.key === role);
            if (match) {
                counts.set(match.label, (counts.get(match.label) ?? 0) + 1);
            }
        });

        return roleLabels.map((item) => ({
            role: item.label,
            count: counts.get(item.label) ?? 0,
        }));
    }, [users]);

    const activity: ActivityItem[] = useMemo(() => {
        const pendingRequests = requests.filter((request) =>
            String(request.status ?? '').toUpperCase() === 'PENDING'
        ).length;
        const approvedRequests = requests.filter((request) =>
            String(request.status ?? '').toUpperCase() === 'APPROVED'
        ).length;
        const assignedAssets = assets.filter((asset) =>
            String(asset.status ?? '').toUpperCase() === 'ASSIGNED'
        ).length;
        const returnQueue = assets.filter((asset) =>
            String(asset.status ?? '').toUpperCase() === 'RETURN_PENDING'
        ).length;

        return [
            { req: 'Pending Requests', count: pendingRequests },
            { req: 'Approved Requests', count: approvedRequests },
            { req: 'Assigned Assets', count: assignedAssets },
            { req: 'Return Queue', count: returnQueue },
        ];
    }, [requests, assets]);

    const alerts: Notifys[] = useMemo(() => {
        const lowStockCount = assets.filter((asset) => {
            if (asset.minimum_stock_level == null || asset.quantity == null) return false;
            return asset.quantity <= asset.minimum_stock_level;
        }).length;

        const pendingApprovals = requests.filter((request) =>
            String(request.status ?? '').toUpperCase() === 'PENDING'
        ).length;

        const openIssues = issues.filter((issue) => issue.status !== 'RESOLVED').length;

        const items: Notifys[] = [];

        if (lowStockCount > 0) {
            items.push({
                Label: `${lowStockCount} low stock ${lowStockCount === 1 ? 'item' : 'items'}`,
                description: 'Review inventory and restock soon.',
            });
        }

        if (pendingApprovals > 0) {
            items.push({
                Label: `${pendingApprovals} pending ${pendingApprovals === 1 ? 'approval' : 'approvals'}`,
                description: 'Asset requests are waiting for review.',
            });
        }

        if (openIssues > 0) {
            items.push({
                Label: `${openIssues} open ${openIssues === 1 ? 'issue' : 'issues'}`,
                description: 'Operations issues need attention.',
            });
        }

        if (items.length === 0) {
            items.push({
                Label: 'All caught up',
                description: 'No critical alerts right now.',
            });
        }

        return items;
    }, [assets, requests, issues]);

    return (
        <ScrollView className="flex-1 h-full bg-background pb-65" showsVerticalScrollIndicator={false}>

            <View className="px-2 pt-4 pb-2">
                <Text className="text-foreground text-lg font-bold ml-2 mb-2">Dashboard Overview</Text>
            </View>
            <FlatList
                data={stats}
                keyExtractor={(item) => item.label}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => <MyCard item={item} />}
                scrollEnabled={false}
            />
            <ListUsers usersByRole={usersByRole} />

            <View className="px-5 py-4">
                <View className="flex-row items-center">
                    <Clock color="#1b72fc" size={18} strokeWidth={2} />
                    <Text className="text-foreground text-lg font-bold ml-2">Current Activity</Text>
                </View>
            </View>
            {/* <Card className='p-0 mx-3 mb-3 bg-accent border border-border shadow-md'> */}
            <FlatList
                data={activity}
                keyExtractor={(item) => item.req}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                columnWrapperStyle={{ justifyContent: 'space-evenly' }}
                renderItem={({ item }) => <SystemActivity item={item} />}
                scrollEnabled={false}
            />
            {/* </Card> */}

            <View className="px-5 py-3">
                <View className="flex-row items-center">
                    <Briefcase color="#1b72fc" size={18} strokeWidth={2} />
                    <Text className="text-foreground text-lg font-bold ml-2">Quick Actions</Text>
                </View>
            </View>
            <Card className='p-0 mx-3 bg-card border border-border shadow-md'>
                <FlatList
                    data={ACTIONS}
                    keyExtractor={(item) => item.Label}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <QuickActions item={item} onPress={() => handleQuickActionPress(item)} />
                    )}
                    scrollEnabled={false}
                />
            </Card>

            <Card className='p-0 mx-3 mt-3 mb-4 bg-primary border border-primary shadow-md'>
                <View className='flex-row items-center px-5 pt-5 pb-3'>
                    <BellRing color='#ffffff' size={20} strokeWidth={2} />
                    <Text className='text-white ml-3 text-lg font-bold'>Alerts & Notifications</Text>
                </View>
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item.Label}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                    renderItem={({ item }) => <AlertsNotifys item={item} />}
                    scrollEnabled={false}
                />
            </Card>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}