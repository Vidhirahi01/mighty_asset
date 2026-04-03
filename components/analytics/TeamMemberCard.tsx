import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    requestsProcessed: number;
    approvalRate: number;
    avgApprovalTime: string;
};

interface TeamMemberCardProps {
    member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
    return (
        <Card className="bg-card border border-border mb-3">
            <CardContent className="pt-4">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className="font-bold text-base text-foreground">{member.name}</Text>
                        <Text className="text-xs text-foreground/60">{member.role}</Text>
                    </View>
                    <View className="bg-success/20 rounded-lg px-2 py-1 border border-success">
                        <Text className="text-sm font-bold text-success">{member.approvalRate}%</Text>
                    </View>
                </View>

                <View className="space-y-2 gap-2">
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-foreground/60">Requests Processed:</Text>
                        <Text className="text-xs font-semibold text-foreground">{member.requestsProcessed}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-foreground/60">Avg Approval Time:</Text>
                        <Text className="text-xs font-semibold text-foreground">{member.avgApprovalTime}</Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View className="mt-3 h-1.5 bg-accent rounded-full overflow-hidden">
                    <View
                        style={{ width: `${member.approvalRate}%` }}
                        className="h-full bg-success rounded-full"
                    />
                </View>
            </CardContent>
        </Card>
    );
}
