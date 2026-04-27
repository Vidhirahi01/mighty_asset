import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeIssues } from '@/hooks/queries/useIssues';

const formatStatus = (status: string) => {
    if (status === 'PENDING_REVIEW') return 'Pending Review';
    if (status === 'PROGRESS_REVIEW') return 'Progress Review';
    if (status === 'ACTIVE') return 'Active';
    return 'Resolved';
};

const statusClass = (status: string) => {
    if (status === 'PENDING_REVIEW') return 'bg-amber-100';
    if (status === 'PROGRESS_REVIEW') return 'bg-sky-100';
    if (status === 'ACTIVE') return 'bg-indigo-100';
    return 'bg-emerald-100';
};

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const prettyDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function Issues() {
    const user = useAuthStore((state) => state.user);
    const { data: issues = [], isLoading } = useEmployeeIssues(user?.id);

    const stats = useMemo(() => ({
        pendingReview: issues.filter((item) => item.status === 'PENDING_REVIEW').length,
        progressReview: issues.filter((item) => item.status === 'PROGRESS_REVIEW').length,
        active: issues.filter((item) => item.status === 'ACTIVE').length,
        resolved: issues.filter((item) => item.status === 'RESOLVED').length,
    }), [issues]);

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View>
                    <Text className="text-2xl font-bold text-foreground">My Issues</Text>
                    <Text className="text-sm text-muted-foreground">Track all issues you reported and their workflow status.</Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    <Card className="w-[48%] border border-amber-200 bg-amber-50"><CardContent className="py-3"><Text className="text-xs text-amber-700">Pending Review</Text><Text className="text-xl font-bold text-amber-800">{stats.pendingReview}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-sky-200 bg-sky-50"><CardContent className="py-3"><Text className="text-xs text-sky-700">Progress Review</Text><Text className="text-xl font-bold text-sky-800">{stats.progressReview}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-indigo-200 bg-indigo-50"><CardContent className="py-3"><Text className="text-xs text-indigo-700">Active</Text><Text className="text-xl font-bold text-indigo-800">{stats.active}</Text></CardContent></Card>
                    <Card className="w-[48%] border border-emerald-200 bg-emerald-50"><CardContent className="py-3"><Text className="text-xs text-emerald-700">Resolved</Text><Text className="text-xl font-bold text-emerald-800">{stats.resolved}</Text></CardContent></Card>
                </View>

                <Card className="border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">Reported Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-3">
                        {isLoading ? (
                            <View className="items-center py-6">
                                <ActivityIndicator color="#1b72fc" />
                                <Text className="mt-2 text-sm text-muted-foreground">Loading issues...</Text>
                            </View>
                        ) : issues.length === 0 ? (
                            <Text className="text-sm text-muted-foreground">No issues reported yet.</Text>
                        ) : issues.map((issue) => (
                            <View key={issue.id} className="rounded-xl border border-border bg-background p-3">
                                <View className="flex-row items-start justify-between gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-foreground">{issue.metadata.title}</Text>
                                        <Text className="mt-1 text-xs text-muted-foreground">{issue.assetName} • {toTitle(issue.assetCategory)}</Text>
                                        <Text className="mt-1 text-xs text-muted-foreground">Reported on {prettyDate(issue.createdAt)}</Text>
                                    </View>
                                    <View className={`rounded-full px-2 py-1 ${statusClass(issue.status)}`}>
                                        <Text className="text-[10px] font-semibold text-foreground">{formatStatus(issue.status)}</Text>
                                    </View>
                                </View>

                                <View className="mt-3 gap-1">
                                    <Text className="text-xs text-foreground/80">{issue.metadata.details}</Text>
                                    <Text className="text-xs text-foreground/70">Priority: {toTitle(issue.metadata.priority)}</Text>
                                    <Text className="text-xs text-foreground/70">Technician: {issue.metadata.assignedTechnician}</Text>
                                </View>
                            </View>
                        ))}
                    </CardContent>
                </Card>
            </View>
            <View style={{ height: 140 }} />
        </ScrollView>
    );
}