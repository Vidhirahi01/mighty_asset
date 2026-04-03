import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    BellRing, TriangleAlert, Users2, ActivitySquare, Settings, History,
    UserCheck, Shield, Briefcase, Wrench, Crown, Clock, CheckCircle2,
    FileText, RotateCcw, TrendingUp
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native';

type StatItem = {
    label: string;
    count: number;
};

const STATS: StatItem[] = [
    { label: 'Total Users', count: 156 },
    { label: 'Active Users', count: 142 },
    { label: 'Total Assets', count: 257 },
    { label: 'Total Requests', count: 3 },
];

const Users: { role: string; count: number }[] = [
    { role: 'Employees', count: 200 },
    { role: 'Manager', count: 45 },
    { role: 'Operation Team', count: 80 },
    { role: 'Technicians', count: 120 },
    { role: 'Administrators', count: 15 },
];
type ActivityItem = {
    req: string;
    count: number;
}
const ACTIVITY: ActivityItem[] = [
    { req: 'New Requests', count: 45 },
    { req: 'Approvals', count: 32 },
    { req: 'Assigns', count: 18 },
    { req: 'Returns', count: 9 },
];
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
const ALERTS: Notifys[] = [
    { Label: 'Database backup scheduled tonight', description: 'Scheduled maintenance at 11:00 PM' },
    { Label: '5 new user accounts created today', description: 'Review and approve' },

];
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

function ListUsers() {
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
                    data={Users}
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
                            {index < Users.length - 1 && <Separator className="bg-border" />}
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
            case 'New Requests': return <FileText color="#1b72fc" {...iconProps} />;
            case 'Approvals': return <CheckCircle2 color="#10b981" {...iconProps} />;
            case 'Assigns': return <UserCheck color="#8b5cf6" {...iconProps} />;
            case 'Returns': return <RotateCcw color="#ef4444" {...iconProps} />;
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

    return (
        <ScrollView className="flex-1 h-full bg-background pb-65" showsVerticalScrollIndicator={false}>

            <View className="px-2 pt-4 pb-2">
                <Text className="text-foreground text-lg font-bold ml-2 mb-2">Dashboard Overview</Text>
            </View>
            <FlatList
                data={STATS}
                keyExtractor={(item) => item.label}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => <MyCard item={item} />}
                scrollEnabled={false}
            />
            <ListUsers />

            <View className="px-5 py-4">
                <View className="flex-row items-center">
                    <Clock color="#1b72fc" size={18} strokeWidth={2} />
                    <Text className="text-foreground text-lg font-bold ml-2">Last 24 Hours Activity</Text>
                </View>
            </View>
            {/* <Card className='p-0 mx-3 mb-3 bg-accent border border-border shadow-md'> */}
            <FlatList
                data={ACTIVITY}
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
                    data={ALERTS}
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