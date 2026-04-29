import { ActivityIndicator, FlatList, View, ScrollView, Pressable } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Wrench, Clock, AlertCircle, ClipboardList, CheckCircle2 } from 'lucide-react-native';
import { useTechnicianIssues } from '@/hooks/queries/useIssues';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { IssuesSection } from '@/components/analytics/IssuesSection';
import type { IssueListItem } from '@/services/issue.service';

type StatItem = {
    label: string;
    count: number;
    subtitle?: string;
    subtitleCount?: number;
};

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Repair Queue': return <ClipboardList {...iconProps} />;
            case 'In Progress': return <Clock {...iconProps} />;
            case 'Completed Today': return <CheckCircle2 {...iconProps} />;
            case 'Total Repairs': return <Wrench {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="mx-2 my-2 flex-1 bg-primary border border-primary shadow-lg">
            <CardContent className="px-5 py-6 items-center justify-center">
                <View className="mb-2 p-2 rounded-full bg-white/20">
                    {getIcon(item.label)}
                </View>
                <Text className="text-white text-xs text-center opacity-90">{item.label}</Text>
                <Text className="mt-3 text-white text-4xl font-bold text-center">{item.count}</Text>
                {item.subtitle ? (
                    <Text className="mt-2 text-white/80 text-sm text-center">
                        {item.subtitle}: {item.subtitleCount ?? 0}
                    </Text>
                ) : null}
            </CardContent>
        </Card>
    );
}

const statusRank: Record<string, number> = {
    ACTIVE: 0,
    PROGRESS_REVIEW: 1,
    PENDING_REVIEW: 2,
    RESOLVED: 3,
};

const priorityRank: Record<string, number> = {
    high: 0,
    medium: 1,
    mid: 1,
    low: 2,
};

const compareBySortMode = (a: IssueListItem, b: IssueListItem, sortMode: SortMode) => {
    if (sortMode === 'priority') {
        const aPriority = priorityRank[String(a.metadata.priority ?? '').toLowerCase()] ?? 1;
        const bPriority = priorityRank[String(b.metadata.priority ?? '').toLowerCase()] ?? 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortMode === 'status') {
        const aStatus = statusRank[a.status] ?? 99;
        const bStatus = statusRank[b.status] ?? 99;
        if (aStatus !== bStatus) return aStatus - bStatus;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

type SortMode = 'newest' | 'status' | 'priority';

export default function TechnicianDashboard() {
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.user);
    const { data: issues = [], isLoading } = useTechnicianIssues(currentUser?.id);

    const [activeTab, setActiveTab] = useState<'overview' | 'repairs'>('overview');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [sortMode, setSortMode] = useState<SortMode>('status');
    const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

    const now = new Date();
    const todayStamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const pendingIssues = useMemo(
        () => issues.filter((issue) => issue.status === 'PENDING_REVIEW'),
        [issues]
    );
    const inProgressIssues = useMemo(
        () => issues.filter((issue) => issue.status === 'ACTIVE' || issue.status === 'PROGRESS_REVIEW'),
        [issues]
    );
    const completedIssues = useMemo(
        () => issues.filter((issue) => issue.status === 'RESOLVED'),
        [issues]
    );
    const completedToday = useMemo(
        () => completedIssues.filter((issue) => {
            const createdAt = new Date(issue.createdAt).getTime();
            return Number.isFinite(createdAt) && createdAt >= todayStamp;
        }),
        [completedIssues, todayStamp]
    );

    const currentActive = inProgressIssues[0] ?? null;

    const sortedRepairs = useMemo(() => {
        let filtered = issues;
        if (statusFilter === 'PENDING') {
            filtered = pendingIssues;
        } else if (statusFilter === 'IN_PROGRESS') {
            filtered = inProgressIssues;
        } else if (statusFilter === 'COMPLETED') {
            filtered = completedIssues;
        }

        if (statusFilter === 'PENDING' && priorityFilter !== 'ALL') {
            filtered = filtered.filter((issue) => {
                const raw = String(issue.metadata.priority ?? '').toLowerCase();
                if (priorityFilter === 'HIGH') return raw === 'high';
                if (priorityFilter === 'MEDIUM') return raw === 'medium' || raw === 'mid';
                if (priorityFilter === 'LOW') return raw === 'low';
                return true;
            });
        }

        return [...filtered].sort((a, b) => compareBySortMode(a, b, sortMode));
    }, [issues, statusFilter, priorityFilter, pendingIssues, inProgressIssues, completedIssues, sortMode]);

    const analyticsIssues = useMemo(
        () => issues.map((issue) => {
            const status: 'Resolved' | 'Open' | 'In Progress' =
                issue.status === 'RESOLVED'
                    ? 'Resolved'
                    : (issue.status === 'PENDING_REVIEW' ? 'Open' : 'In Progress');

            return {
                id: issue.id,
                title: issue.metadata.title,
                description: issue.metadata.details,
                reportedBy: issue.reportedByName,
                reportedByEmail: issue.reportedByEmail,
                category: issue.assetCategory,
                priority: ((): 'High' | 'Medium' | 'Low' => {
                    const raw = String(issue.metadata.priority ?? '').toLowerCase();
                    if (raw === 'high') return 'High';
                    if (raw === 'low') return 'Low';
                    return 'Medium';
                })(),
                status,
                reportedAt: issue.createdAt,
                assignedTo: issue.metadata.assignedTechnician,
            };
        }),
        [issues]
    );

    const assignedCount = pendingIssues.length;
    const inProgressCount = inProgressIssues.length;

    const stats: StatItem[] = useMemo(() => (
        [
            { label: 'Repair Queue', count: assignedCount },
            { label: 'In Progress', count: inProgressCount },
            { label: 'Completed Today', count: completedToday.length, subtitle: 'Completed', subtitleCount: completedIssues.length },
            { label: 'Total Repairs', count: issues.length },
        ]
    ), [assignedCount, inProgressCount, completedToday.length, completedIssues.length, issues.length]);

    return (
        <ScrollView className="flex-1 bg-background " showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View className="gap-4">

                    <CardContent className="px-0">
                        <FlatList
                            data={stats}
                            keyExtractor={(item) => item.label}
                            numColumns={2}
                            contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            renderItem={({ item }) => <MyCard item={item} />}
                            scrollEnabled={false}
                        />
                    </CardContent>

                    <View className="flex-row gap-2 bg-accent/40 rounded-lg p-1 border border-border/20">
                        {[{ key: 'overview', label: 'Overview' }, { key: 'repairs', label: 'Repairs' }].map((tab) => {
                            const active = activeTab === tab.key;
                            return (
                                <Pressable
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`flex-1 py-2.5 rounded-md items-center ${active ? 'bg-primary' : ''}`}
                                >
                                    <Text className={`font-bold text-xs ${active ? 'text-white' : 'text-foreground'}`}>
                                        {tab.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {activeTab === 'overview' && (
                        <>
                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Current Active Repair</CardTitle>
                                    <CardDescription className="text-foreground/60">Work in progress right now</CardDescription>
                                </CardHeader>
                                <CardContent className="gap-3">
                                    {currentActive ? (
                                        <Pressable
                                            onPress={() => router.push({ pathname: '/(technician)/issue-details', params: { issueId: currentActive.id } })}
                                            className="rounded-xl border border-border bg-background p-3"
                                        >
                                            <Text className="text-sm font-semibold text-foreground">{currentActive.metadata.title}</Text>
                                            <Text className="mt-1 text-xs text-foreground/60">{currentActive.assetName} • {toTitle(currentActive.assetCategory)}</Text>
                                            <Text className="mt-1 text-xs text-foreground/60">Status: {toTitle(currentActive.status.toLowerCase().replace('_', ' '))}</Text>
                                            <Text className="mt-1 text-xs text-foreground/70">Priority: {toTitle(String(currentActive.metadata.priority ?? 'medium'))}</Text>
                                        </Pressable>
                                    ) : (
                                        <Text className="text-sm text-foreground/60">No active repair right now.</Text>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Pending Repairs</CardTitle>
                                    <CardDescription className="text-foreground/60">Filter by priority</CardDescription>
                                </CardHeader>
                                <CardContent className="gap-3">
                                    <View className="flex-row flex-wrap gap-2">
                                        {[
                                            { key: 'ALL', label: 'All' },
                                            { key: 'HIGH', label: 'High' },
                                            { key: 'MEDIUM', label: 'Mid' },
                                            { key: 'LOW', label: 'Low' },
                                        ].map((chip) => {
                                            const active = priorityFilter === chip.key;
                                            return (
                                                <Pressable
                                                    key={chip.key}
                                                    onPress={() => setPriorityFilter(chip.key as typeof priorityFilter)}
                                                    className={`rounded-full border px-3 py-1.5 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                                                >
                                                    <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground/70'}`}>
                                                        {chip.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    {isLoading ? (
                                        <View className="items-center py-4">
                                            <ActivityIndicator color="#1b72fc" />
                                            <Text className="mt-2 text-sm text-foreground/60">Loading repairs...</Text>
                                        </View>
                                    ) : pendingIssues.length === 0 ? (
                                        <Text className="text-sm text-foreground/60">No pending repairs.</Text>
                                    ) : (
                                        sortedRepairs
                                            .filter((issue) => issue.status === 'PENDING_REVIEW')
                                            .map((issue) => (
                                                <Pressable
                                                    key={issue.id}
                                                    onPress={() => router.push({ pathname: '/(technician)/issue-details', params: { issueId: issue.id } })}
                                                    className="rounded-xl border border-border bg-background p-3"
                                                >
                                                    <Text className="text-sm font-semibold text-foreground">{issue.metadata.title}</Text>
                                                    <Text className="mt-1 text-xs text-foreground/60">{issue.assetName} • {toTitle(issue.assetCategory)}</Text>
                                                    <Text className="mt-1 text-xs text-foreground/60">Priority: {toTitle(String(issue.metadata.priority ?? 'medium'))}</Text>
                                                </Pressable>
                                            ))
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === 'repairs' && (
                        <>
                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Repairs</CardTitle>
                                    <CardDescription className="text-foreground/60">Analytics and all assigned issues</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <IssuesSection issues={analyticsIssues} mode="manager" />
                                </CardContent>
                            </Card>

                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Assigned Issues</CardTitle>
                                    <CardDescription className="text-foreground/60">All technician work, sorted the way you need</CardDescription>
                                </CardHeader>
                                <CardContent className="gap-3">
                                    <View className="flex-row flex-wrap gap-2">
                                        {[
                                            { key: 'status', label: 'Status' },
                                            { key: 'priority', label: 'Priority' },
                                            { key: 'newest', label: 'Newest' },
                                        ].map((chip) => {
                                            const active = sortMode === chip.key;
                                            return (
                                                <Pressable
                                                    key={chip.key}
                                                    onPress={() => setSortMode(chip.key as SortMode)}
                                                    className={`rounded-full border px-3 py-1.5 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                                                >
                                                    <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground/70'}`}>
                                                        {chip.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    <View className="flex-row flex-wrap gap-2">
                                        {[
                                            { key: 'ALL', label: 'All' },
                                            { key: 'PENDING', label: 'Pending' },
                                            { key: 'IN_PROGRESS', label: 'In Progress' },
                                            { key: 'COMPLETED', label: 'Completed' },
                                        ].map((chip) => {
                                            const active = statusFilter === chip.key;
                                            return (
                                                <Pressable
                                                    key={chip.key}
                                                    onPress={() => setStatusFilter(chip.key as typeof statusFilter)}
                                                    className={`rounded-full border px-3 py-1.5 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                                                >
                                                    <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground/70'}`}>
                                                        {chip.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    {isLoading ? (
                                        <View className="items-center py-4">
                                            <ActivityIndicator color="#1b72fc" />
                                            <Text className="mt-2 text-sm text-foreground/60">Loading repairs...</Text>
                                        </View>
                                    ) : sortedRepairs.length === 0 ? (
                                        <Text className="text-sm text-foreground/60">No assigned issues found.</Text>
                                    ) : (
                                        sortedRepairs.map((issue) => (
                                            <Pressable
                                                key={issue.id}
                                                onPress={() => router.push({ pathname: '/(technician)/issue-details', params: { issueId: issue.id } })}
                                                className="rounded-xl border border-border bg-background p-3"
                                            >
                                                <Text className="text-sm font-semibold text-foreground">{issue.metadata.title}</Text>
                                                <Text className="mt-1 text-xs text-foreground/60">{issue.assetName} • {toTitle(issue.assetCategory)}</Text>
                                                <Text className="mt-1 text-xs text-foreground/60">Status: {toTitle(issue.status.toLowerCase().replace('_', ' '))}</Text>
                                                <Text className="mt-1 text-xs text-foreground/70">Priority: {toTitle(String(issue.metadata.priority ?? 'medium'))}</Text>
                                            </Pressable>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </View>
            </View>
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}