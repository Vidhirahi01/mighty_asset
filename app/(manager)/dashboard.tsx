import { View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { BarChart3, Users, CheckSquare } from 'lucide-react-native';

export default function ManagerDashboard() {
    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Quick Stats */}
                <View className="gap-4">
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Team Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-primary/10 rounded-lg p-4 items-center">
                                    <Users size={32} color="#1b72fc" />
                                    <Text className="text-foreground/80 mt-2">Team Members</Text>
                                </View>
                                <View className="flex-1 bg-success/10 rounded-lg p-4 items-center">
                                    <CheckSquare size={32} color="#22c55e" />
                                    <Text className="text-foreground/80 mt-2">Tasks</Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Manager Features */}
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Quick Access</CardTitle>
                            <CardDescription className="text-foreground/60">Manage your team and operations</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-3">
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <Users size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">Manage Team</Text>
                                </View>
                            </Pressable>
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <BarChart3 size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">View Reports</Text>
                                </View>
                            </Pressable>
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <CheckSquare size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">Approve Tasks</Text>
                                </View>
                            </Pressable>
                        </CardContent>
                    </Card>
                </View>
            </View>
        </ScrollView>
    );
}
