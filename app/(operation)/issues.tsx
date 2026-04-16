import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TeamIssue } from '@/components/analytics/IssueCard';
import { IssuesSection } from '@/components/analytics/IssuesSection';

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

export default function IssuesScreen() {
    const [issues, setIssues] = useState<TeamIssue[]>(TEAM_ISSUES);

    const handleAssignTechnician = (issueId: string, technicianName: string) => {
        setIssues((current) =>
            current.map((issue) =>
                issue.id === issueId ? { ...issue, assignedTo: technicianName } : issue
            )
        );
    };

    const handleStatusChange = (issueId: string, status: TeamIssue['status']) => {
        setIssues((current) =>
            current.map((issue) =>
                issue.id === issueId ? { ...issue, status } : issue
            )
        );
    };

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <IssuesSection
                    issues={issues}
                    mode="operations"
                    onAssignTechnician={handleAssignTechnician}
                    onStatusChange={handleStatusChange}
                />
            </View>
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}