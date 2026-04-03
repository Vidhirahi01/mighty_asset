import { View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FileText, Calendar, User } from 'lucide-react-native';

export default function EmployeeDashboard() {
    return (
        <ScrollView className="flex-1 bg-background pb-24" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Employee Overview */}
                <View className="gap-4">
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Your Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-primary/10 rounded-lg p-4 items-center">
                                    <User size={32} color="#1b72fc" />
                                    <Text className="text-foreground/80 mt-2">Profile</Text>
                                </View>
                                <View className="flex-1 bg-success/10 rounded-lg p-4 items-center">
                                    <Calendar size={32} color="#22c55e" />
                                    <Text className="text-foreground/80 mt-2">Schedule</Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Employee Features */}
                    <Card className="bg-card border border-border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Quick Access</CardTitle>
                            <CardDescription className="text-foreground/60">Manage your work and documents</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-3">
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <FileText size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">My Documents</Text>
                                </View>
                            </Pressable>
                            <Pressable className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <View className="flex-row items-center gap-3">
                                    <Calendar size={20} color="#1b72fc" />
                                    <Text className="text-foreground font-semibold flex-1">My Schedule</Text>
                                </View>
                            </Pressable>
                        </CardContent>
                    </Card>
                </View>
            </View>
        </ScrollView>
    );
}
