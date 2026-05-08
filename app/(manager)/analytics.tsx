import React, { useMemo } from 'react';
import { ActivityIndicator, View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { AlertCircle } from 'lucide-react-native';
import { TeamIssue } from '@/components/analytics/IssueCard';
import { IssuesSection } from '@/components/analytics/IssuesSection';
import { useOperationsIssues } from '@/hooks/queries/useIssues';
import { IssueListItem, IssueWorkflowStatus } from '@/services/issue.service';

const relativeTime = (value: string) => {
    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return 'Unknown time';
    const diff = Math.max(1, Math.floor((Date.now() - ts) / (1000 * 60)));
    if (diff < 60) return `${diff} min ago`;
    const hr = Math.floor(diff / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? 's' : ''} ago`;
};

const toManagerStatus = (status: IssueWorkflowStatus): TeamIssue['status'] => {
    if (status === 'RESOLVED') return 'Resolved';
    if (status === 'ACTIVE' || status === 'PROGRESS_REVIEW') return 'In Progress';
    return 'Open';
};

const toPriority = (value: string): TeamIssue['priority'] => {
    const raw = value.trim().toLowerCase();
    if (raw === 'high') return 'High';
    if (raw === 'low') return 'Low';
    return 'Medium';
};

const toTeamIssue = (issue: IssueListItem): TeamIssue => ({
    id: issue.id,
    title: issue.metadata.title,
    description: issue.metadata.details,
    reportedBy: issue.reportedByName,
    reportedByEmail: issue.reportedByEmail,
    category: issue.assetCategory,
    priority: toPriority(issue.metadata.priority),
    status: toManagerStatus(issue.status),
    reportedAt: relativeTime(issue.createdAt),
    assignedTo: issue.metadata.assignedTechnician === 'Unassigned' ? undefined : issue.metadata.assignedTechnician,
});

export default function AnalyticsScreen() {
    const { data: issues = [], isLoading } = useOperationsIssues();
    const teamIssues = useMemo(() => issues.map(toTeamIssue), [issues]);

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View className="flex-row items-center gap-2">
                    <AlertCircle size={16} color="#1a1a1a" />
                    <Text className="font-bold text-sm text-foreground">Issues</Text>
                </View>
                {isLoading ? (
                    <View className="items-center py-6">
                        <ActivityIndicator color="#1b72fc" />
                        <Text className="mt-2 text-sm text-muted-foreground">Loading issues...</Text>
                    </View>
                ) : teamIssues.length === 0 ? (
                    <Text className="text-sm text-muted-foreground">No issues reported yet.</Text>
                ) : (
                    <IssuesSection issues={teamIssues} mode="manager" />
                )}
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
