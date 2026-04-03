import { View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Wrench, Clock, AlertCircle } from 'lucide-react-native';

export default function TechnicianDashboard() {
    return (
        <ScrollView className="flex-1 bg-background " showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Assigned Tasks */}
                <View className="gap-4">
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Work Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-primary/10 rounded-lg p-4 items-center">
                                    <Wrench size={32} color="#1b72fc" />
                                    <Text className="text-foreground/80 mt-2">Assigned</Text>
                                </View>
                                <View className="flex-1 bg-warning/10 rounded-lg p-4 items-center">
                                    <Clock size={32} color="#f59e0b" />
                                    <Text className="text-foreground/80 mt-2">In Progress</Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Technician Features */}
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
                </View>
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
