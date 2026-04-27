import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAssignIssueTechnician, useIssueTechnicians, useOperationsIssues, useUpdateIssueStatus } from '@/hooks/queries/useIssues';
import { IssueWorkflowStatus } from '@/services/issue.service';

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatStatus = (status: IssueWorkflowStatus) => {
    if (status === 'PENDING_REVIEW') return 'Pending Review';
    if (status === 'PROGRESS_REVIEW') return 'Progress Review';
    if (status === 'ACTIVE') return 'Active';
    return 'Resolved';
};

const statusBadgeClass = (status: IssueWorkflowStatus) => {
    if (status === 'PENDING_REVIEW') return 'bg-amber-100';
    if (status === 'PROGRESS_REVIEW') return 'bg-sky-100';
    if (status === 'ACTIVE') return 'bg-indigo-100';
    return 'bg-emerald-100';
};

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

export default function IssuesScreen() {
    const { data: issues = [], isLoading } = useOperationsIssues();
    const { data: technicians = [] } = useIssueTechnicians();
    const updateStatus = useUpdateIssueStatus();
    const assignTechnician = useAssignIssueTechnician();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedTechnicianByIssue, setSelectedTechnicianByIssue] = useState<Record<string, string>>({});

    const stats = useMemo(() => ({
        pendingReview: issues.filter((item) => item.status === 'PENDING_REVIEW').length,
        progressReview: issues.filter((item) => item.status === 'PROGRESS_REVIEW').length,
        active: issues.filter((item) => item.status === 'ACTIVE').length,
        resolved: issues.filter((item) => item.status === 'RESOLVED').length,
    }), [issues]);

    const handleStatus = (issueId: string, status: IssueWorkflowStatus) => {
        updateStatus.mutate({ issueId, status });
    };

    const handleAssign = (issueId: string) => {
        const tech = selectedTechnicianByIssue[issueId] || technicians[0]?.name;
        if (!tech) return;
        assignTechnician.mutate({ issueId, technicianName: tech, activate: true });
    };

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View>
                    <Text className="text-2xl font-bold text-foreground">Issue Operations</Text>
                    <Text className="text-sm text-muted-foreground">Review, approve, assign technicians, and track issue progress.</Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    <Card className="w-[48%] border border-amber-200 bg-amber-50"><CardContent className="py-3"><Text className="text-xs text-amber-700">Pending Review</Text><Text className="text-xl font-bold text-amber-800">{stats.pendingReview}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-sky-200 bg-sky-50"><CardContent className="py-3"><Text className="text-xs text-sky-700">Progress Review</Text><Text className="text-xl font-bold text-sky-800">{stats.progressReview}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-indigo-200 bg-indigo-50"><CardContent className="py-3"><Text className="text-xs text-indigo-700">Active</Text><Text className="text-xl font-bold text-indigo-800">{stats.active}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-emerald-200 bg-emerald-50"><CardContent className="py-3"><Text className="text-xs text-emerald-700">Resolved</Text><Text className="text-xl font-bold text-emerald-800">{stats.resolved}</Text></CardContent></Card>
                </View>

                <Card className="border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">All Reported Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-3">
                        {isLoading ? (
                            <View className="items-center py-6">
                                <ActivityIndicator color="#1b72fc" />
                                <Text className="mt-2 text-sm text-muted-foreground">Loading issues...</Text>
                            </View>
                        ) : issues.length === 0 ? (
                            <Text className="text-sm text-muted-foreground">No issues found in issues table.</Text>
                        ) : issues.map((issue) => {
                            const expanded = expandedId === issue.id;
                            const selectedTech = selectedTechnicianByIssue[issue.id] || issue.metadata.assignedTechnician || technicians[0]?.name || '';

                            return (
                                <Pressable key={issue.id} onPress={() => setExpandedId(expanded ? null : issue.id)} className="rounded-xl border border-border bg-background p-3">
                                    <View className="flex-row items-start justify-between gap-3">
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-foreground">{issue.metadata.title}</Text>
                                            <Text className="mt-1 text-xs text-muted-foreground">{issue.assetName} • {toTitle(issue.assetCategory)}</Text>
                                            <Text className="mt-1 text-xs text-muted-foreground">Reported by {issue.reportedByName} • {relativeTime(issue.createdAt)}</Text>
                                        </View>
                                        <View className={`rounded-full px-2 py-1 ${statusBadgeClass(issue.status)}`}>
                                            <Text className="text-[10px] font-semibold text-foreground">{formatStatus(issue.status)}</Text>
                                        </View>
                                        {expanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                                    </View>

                                    {expanded ? (
                                        <View className="mt-3 gap-2">
                                            <Text className="text-xs text-foreground/80">{issue.metadata.details}</Text>
                                            <Text className="text-xs text-foreground/70">Priority: {toTitle(issue.metadata.priority)}</Text>
                                            <Text className="text-xs text-foreground/70">Started: {issue.metadata.startedAt}</Text>
                                            <Text className="text-xs text-foreground/70">Technician: {issue.metadata.assignedTechnician}</Text>

                                            <View className="mt-2 flex-row flex-wrap gap-2">
                                                {technicians.map((tech) => {
                                                    const selected = selectedTech === tech.name;
                                                    return (
                                                        <Pressable
                                                            key={`${issue.id}-${tech.id}`}
                                                            onPress={() => setSelectedTechnicianByIssue((prev) => ({ ...prev, [issue.id]: tech.name }))}
                                                            className={`rounded-full border px-3 py-1 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                                                            <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{tech.name}</Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>

                                            <View className="mt-2 flex-row flex-wrap gap-2">
                                                <Pressable
                                                    onPress={() => handleStatus(issue.id, 'PENDING_REVIEW')}
                                                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-amber-800">Pending Review</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleStatus(issue.id, 'PROGRESS_REVIEW')}
                                                    className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-sky-800">Approve Progress</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleAssign(issue.id)}
                                                    className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-indigo-800">Assign Technician</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleStatus(issue.id, 'ACTIVE')}
                                                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-blue-800">Mark Active</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleStatus(issue.id, 'RESOLVED')}
                                                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-emerald-800">Mark Resolved</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </CardContent>
                </Card>
            </View>
            <View style={{ height: 140 }} />
        </ScrollView>
    );
}