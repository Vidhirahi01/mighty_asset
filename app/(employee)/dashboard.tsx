import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { AlertCircle, BriefcaseBusiness, Users2, Settings, History, Briefcase, Plus, PackagePlusIcon } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';


type QuickAction = {
    Label: string;
    description: string;
}
const ACTIONS: QuickAction[] = [
    { Label: 'Request Asset', description: 'Submit new asset request' },
    { Label: 'Report Issue', description: 'Report a problem with your asset' },
    { Label: 'Return Asset', description: 'Initiate asset return' },
    { Label: 'View My Assets', description: 'See all assigned assets' }

];
function QuickActions({ item, onPress }: { item: QuickAction; onPress: () => void }) {
    const getActionIcon = (label: string) => {
        const iconProps = { size: 20, strokeWidth: 2, color: '#1b72fc' };
        switch (label) {
            case 'Request Asset': return <Plus {...iconProps} />;
            case 'Report Issue': return <AlertCircle {...iconProps} />;
            case 'Return Asset': return <History {...iconProps} />;
            case 'View My Assets': return <PackagePlusIcon {...iconProps} />;
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
export default function EmployeeDashboard() {
    const router = useRouter();

    const handleQuickActionPress = (action: QuickAction) => {
        if (action.Label === 'Request Asset') {
            router.push('/request-asset');
            return;
        }

        if (action.Label === 'Report Issue') {
            router.push('/report-issue');
            return;
        }

        if (action.Label === 'Return Asset') {
            router.push('/return-asset');
            return;
        }

        if (action.Label === 'View My Assets') {
            router.push('/myassets');
            return;
        }

        console.log(`Quick action pressed: ${action.Label}`);
    };

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6">
                <View className="mb-4">
                    <Text className="text-foreground text-2xl font-bold">Employee Dashboard</Text>
                    <Text className="text-foreground/60 text-sm mt-1">Track your assigned assets and issue activity</Text>
                </View>

                <View className="flex-row gap-3">
                    <Card className="flex-1 border border-border bg-card">
                        <CardHeader className="pb-2">
                            <View className="flex-row items-center gap-2">
                                <BriefcaseBusiness size={18} color="#2563eb" strokeWidth={2} />
                                <CardTitle className="text-sm text-foreground">My Assets</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-3xl font-bold text-foreground">0</Text>
                            <Text className="text-xs text-foreground/60 mt-1">Currently assigned</Text>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 border border-border bg-card">
                        <CardHeader className="pb-2">
                            <View className="flex-row items-center gap-2">
                                <AlertCircle size={18} color="#ea580c" strokeWidth={2} />
                                <CardTitle className="text-sm text-foreground">Active Issue</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-3xl font-bold text-foreground">0</Text>
                            <Text className="text-xs text-foreground/60 mt-1">Open issues</Text>
                        </CardContent>
                    </Card>
                </View>
                <View className="px-2 py-3">
                    <View className="flex-row items-center">
                        <Briefcase color="#1b72fc" size={18} strokeWidth={2} />
                        <Text className="text-foreground text-lg font-bold ml-2">Quick Actions</Text>
                    </View>
                </View>
                <Card className='p-0  bg-primary-50 border border-border shadow-md'>
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
                <View style={{ height: 160 }} />
            </View>
        </ScrollView>
    );
}
