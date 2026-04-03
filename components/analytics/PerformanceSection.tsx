import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { TeamMemberCard, TeamMember } from './TeamMemberCard';

interface PerformanceSectionProps {
    teamMembers: TeamMember[];
}

export function PerformanceSection({ teamMembers }: PerformanceSectionProps) {
    const totalRequests = teamMembers.reduce((sum, m) => sum + m.requestsProcessed, 0);
    const avgApprovalRate = Math.round(teamMembers.reduce((sum, m) => sum + m.approvalRate, 0) / teamMembers.length);

    return (
        <View>
            {/* Performance Metrics */}
            <View className="flex-row gap-3 mb-4">
                <Card className="flex-1 bg-primary/10 border border-primary">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-primary">{totalRequests}</Text>
                        <Text className="text-xs text-foreground/60">Total Requests</Text>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-success/10 border border-success">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-success">{avgApprovalRate}%</Text>
                        <Text className="text-xs text-foreground/60">Avg Rate</Text>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-info/10 border border-info">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-info">{teamMembers.length}</Text>
                        <Text className="text-xs text-foreground/60">Team Size</Text>
                    </CardContent>
                </Card>
            </View>

            <Text className="text-base font-bold mb-3 text-foreground">Team Performance</Text>
            {teamMembers.map(member => (
                <TeamMemberCard key={member.id} member={member} />
            ))}
        </View>
    );
}
