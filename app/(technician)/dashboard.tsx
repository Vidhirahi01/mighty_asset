import { ActivityIndicator, View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Wrench, Clock, AlertCircle } from 'lucide-react-native';
import { useTechnicianIssues } from '@/hooks/queries/useIssues';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function TechnicianDashboard() {
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.user);
    const { data: issues = [], isLoading } = useTechnicianIssues(currentUser?.id);

    const assignedCount = issues.filter((issue) => issue.status === 'ACTIVE').length;
    const inProgressCount = issues.filter((issue) => issue.status === 'PROGRESS_REVIEW').length;

    return (
        <ScrollView className="flex-1 bg-background " showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View className="gap-4">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Work Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <View className="flex-row gap-4">
                            <View className="flex-1 bg-primary/10 rounded-lg p-4 items-center">
                                <Wrench size={32} color="#1b72fc" />
                                <Text className="text-foreground/80 mt-2">Assigned</Text>
                                <Text className="text-foreground font-bold mt-1">{assignedCount}</Text>
                            </View>
                            <View className="flex-1 bg-warning/10 rounded-lg p-4 items-center">
                                <Clock size={32} color="#f59e0b" />
                                <Text className="text-foreground/80 mt-2">In Progress</Text>
                                <Text className="text-foreground font-bold mt-1">{inProgressCount}</Text>
                            </View>
                        </View>
                    </CardContent>
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Quick Access</CardTitle>
                            <CardDescription className="text-foreground/60">View and manage your tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-3">
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <Wrench size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">View Work Orders</Text>
                                </View>
                            </Pressable>
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <AlertCircle size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">Report Issues</Text>
                                </View>
                            </Pressable>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Assigned Issues</CardTitle>
                            <CardDescription className="text-foreground/60">Issues linked to your assignments</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-3">
                            {isLoading ? (
                                <View className="items-center py-4">
                                    <ActivityIndicator color="#1b72fc" />
                                    <Text className="mt-2 text-sm text-foreground/60">Loading issues...</Text>
                                </View>
                            ) : issues.length === 0 ? (
                                <Text className="text-sm text-foreground/60">No assigned issues yet.</Text>
                            ) : (
                                issues.map((issue) => (
                                    <Pressable
                                        key={issue.id}
                                        onPress={() => router.push({ pathname: '/(technician)/issue-details', params: { issueId: issue.id } })}
                                        className="rounded-xl border border-border bg-background p-3"
                                    >
                                        <Text className="text-sm font-semibold text-foreground">{issue.metadata.title}</Text>
                                        <Text className="mt-1 text-xs text-foreground/60">{issue.assetName} • {toTitle(issue.assetCategory)}</Text>
                                        <Text className="mt-1 text-xs text-foreground/60">Status: {toTitle(issue.status.toLowerCase().replace('_', ' '))}</Text>
                                        <Text className="mt-1 text-xs text-foreground/70">Technician: {issue.metadata.assignedTechnician}</Text>
                                    </Pressable>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </View>
            </View>
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
