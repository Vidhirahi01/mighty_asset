import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { AlertCircle, Gauge } from 'lucide-react-native';
import { IssueCard, TeamIssue } from '@/components/analytics/IssueCard';
import { TeamMemberCard, TeamMember } from '@/components/analytics/TeamMemberCard';
import { IssuesSection } from '@/components/analytics/IssuesSection';
import { PerformanceSection } from '@/components/analytics/PerformanceSection';

// Sample data
const TEAM_ISSUES: TeamIssue[] = [
    {
        id: '1',
        title: 'Server Connection Timeout',
        description: 'API calls timing out intermittently affecting workflow productivity.',
        reportedBy: 'Alice Chen',
        reportedByEmail: 'alice.chen@company.com',
        category: 'Technical',
        priority: 'High',
        status: 'Open',
        reportedAt: '3 hours ago',
        assignedTo: 'Tech Support',
    },
    {
        id: '2',
        title: 'Missing VPN Access',
        description: 'New team member unable to access corporate VPN after account setup.',
        reportedBy: 'Bob Wilson',
        reportedByEmail: 'bob.wilson@company.com',
        category: 'Access',
        priority: 'High',
        status: 'In Progress',
        reportedAt: '5 hours ago',
        assignedTo: 'IT Operations',
    },
    {
        id: '3',
        title: 'Software License Expiry',
        description: 'Design software license expiring next week. Renewal order needed.',
        reportedBy: 'Carol Davis',
        reportedByEmail: 'carol.davis@company.com',
        category: 'Licensing',
        priority: 'Medium',
        status: 'Open',
        reportedAt: '1 day ago',
    },
];

const TEAM_PERFORMANCE: TeamMember[] = [
    {
        id: '1',
        name: 'Alice Chen',
        role: 'Manager',
        requestsProcessed: 287,
        approvalRate: 78,
        avgApprovalTime: '2h 15min',
    },
    {
        id: '2',
        name: 'Bob Wilson',
        role: 'Senior Coordinator',
        requestsProcessed: 156,
        approvalRate: 82,
        avgApprovalTime: '1h 45min',
    },
    {
        id: '3',
        name: 'Carol Davis',
        role: 'Coordinator',
        requestsProcessed: 134,
        approvalRate: 76,
        avgApprovalTime: '2h 30min',
    },
];

export default function AnalyticsScreen() {
    const [activeTab, setActiveTab] = useState<'issues' | 'performance'>('issues');

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Tab Toggle */}
                <View className="flex-row gap-2 bg-accent/50 rounded-lg p-1 border border-border/20">
                    <Pressable
                        onPress={() => setActiveTab('issues')}
                        className={`flex-1 py-3 rounded-md flex-row items-center justify-center gap-2 ${activeTab === 'issues' ? 'bg-primary' : ''}`}
                    >
                        <AlertCircle size={16} color={activeTab === 'issues' ? '#ffffff' : '#1a1a1a'} />
                        <Text className={`font-bold text-sm ${activeTab === 'issues' ? 'text-white' : 'text-foreground'}`}>
                            Issues
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('performance')}
                        className={`flex-1 py-3 rounded-md flex-row items-center justify-center gap-2 ${activeTab === 'performance' ? 'bg-primary' : ''}`}
                    >
                        <Gauge size={16} color={activeTab === 'performance' ? '#ffffff' : '#1a1a1a'} />
                        <Text className={`font-bold text-sm ${activeTab === 'performance' ? 'text-white' : 'text-foreground'}`}>
                            Performance
                        </Text>
                    </Pressable>
                </View>

                {/* Issues Tab */}
                {activeTab === 'issues' && (
                    <IssuesSection issues={TEAM_ISSUES} mode="manager" />
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <PerformanceSection teamMembers={TEAM_PERFORMANCE} />
                )}
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
