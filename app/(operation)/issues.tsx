import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAssignIssueTechnician, useIssueTechnicians, useOperationsIssues, useUpdateIssueStatus } from '@/hooks/queries/useIssues';
import { IssueListItem, IssueWorkflowStatus } from '@/services/issue.service';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useAuthStore } from '@/store/authStore';

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
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = ['55%', '85%'];
    const currentUser = useAuthStore((state) => state.user);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | IssueWorkflowStatus>('ALL');
    const [selectedIssue, setSelectedIssue] = useState<IssueListItem | null>(null);
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );

    const stats = useMemo(() => ({
        pendingReview: issues.filter((item) => item.status === 'PENDING_REVIEW').length,
        progressReview: issues.filter((item) => item.status === 'PROGRESS_REVIEW').length,
        active: issues.filter((item) => item.status === 'ACTIVE').length,
        resolved: issues.filter((item) => item.status === 'RESOLVED').length,
    }), [issues]);

    const visibleIssues = useMemo(() => {
        const filtered = selectedStatusFilter === 'ALL'
            ? issues
            : issues.filter((item) => item.status === selectedStatusFilter);

        return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [issues, selectedStatusFilter]);

    const handleStatus = (issueId: string, status: IssueWorkflowStatus) => {
        updateStatus.mutate({ issueId, status });
    };

    const handleAssign = (issueId: string) => {
        const issue = issues.find((item) => item.id === issueId) ?? null;
        if (!issue) return;

        setSelectedIssue(issue);
        const defaultTech = technicians[0];
        const preselectedTech = technicians.find((tech) => tech.name === issue.metadata.assignedTechnician) ?? defaultTech;
        setSelectedTechnician(preselectedTech?.name || '');
        setSelectedTechnicianId(preselectedTech?.id || '');
        bottomSheetModalRef.current?.present();
    };

    const handleConfirmTechnician = () => {
        if (!selectedIssue || !selectedTechnician || !selectedTechnicianId) return;

        assignTechnician.mutate(
            {
                issueId: selectedIssue.id,
                technicianId: selectedTechnicianId,
                technicianName: selectedTechnician,
                assignedById: currentUser?.id ?? null,
                activate: true,
            },
            {
                onSuccess: () => {
                    bottomSheetModalRef.current?.dismiss();
                    setSelectedIssue(null);
                },
            }
        );
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                    <View className="flex-row gap-2 px-1">
                        {([
                            { key: 'ALL', label: 'All', count: issues.length },
                            { key: 'PENDING_REVIEW', label: 'Pending Review', count: stats.pendingReview },
                            { key: 'PROGRESS_REVIEW', label: 'Progress Review', count: stats.progressReview },
                            { key: 'ACTIVE', label: 'Active', count: stats.active },
                            { key: 'RESOLVED', label: 'Resolved', count: stats.resolved },
                        ] as const).map((chip) => {
                            const active = selectedStatusFilter === chip.key;
                            return (
                                <Pressable
                                    key={chip.key}
                                    onPress={() => setSelectedStatusFilter(chip.key)}
                                    className={`rounded-full border px-3 py-2 ${active ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                                >
                                    <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>
                                        {chip.label} ({chip.count})
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

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
                        ) : visibleIssues.length === 0 ? (
                            <Text className="text-sm text-muted-foreground">No issues found in issues table.</Text>
                        ) : visibleIssues.map((issue) => {
                            const expanded = expandedId === issue.id;

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

                                                <Pressable
                                                    onPress={() => handleAssign(issue.id)}
                                                    className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2">
                                                    <Text className="text-xs font-semibold text-indigo-800">Assign Technician</Text>
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

            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: '#f8f9fa' }}
                handleIndicatorStyle={{ backgroundColor: '#1b72fc' }}
                onDismiss={() => {
                    setSelectedIssue(null);
                    setSelectedTechnician('');
                    setSelectedTechnicianId('');
                }}
            >
                <BottomSheetScrollView className="flex-1 bg-background px-4 pt-4" keyboardShouldPersistTaps="handled">
                    <View className="mb-4 flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-foreground">Assign Technician</Text>
                            <Text className="mt-1 text-sm text-muted-foreground">Select technician and review issue details before assigning.</Text>
                        </View>
                    </View>

                    {selectedIssue ? (
                        <View className="gap-4 pb-32">
                            <Card className="border border-border bg-card">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Issue Details</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-2">
                                    <Text className="text-sm font-semibold text-foreground">{selectedIssue.metadata.title}</Text>
                                    <Text className="text-xs text-muted-foreground">{selectedIssue.assetName} • {toTitle(selectedIssue.assetCategory)}</Text>
                                    <Text className="text-xs text-muted-foreground">Reported by {selectedIssue.reportedByName}</Text>
                                    <Text className="text-xs text-muted-foreground">Status: {formatStatus(selectedIssue.status)}</Text>
                                    <Text className="text-xs text-foreground/80">{selectedIssue.metadata.details}</Text>
                                    <Text className="text-xs text-foreground/70">Priority: {toTitle(selectedIssue.metadata.priority)}</Text>
                                    <Text className="text-xs text-foreground/70">Started: {selectedIssue.metadata.startedAt}</Text>
                                </CardContent>
                            </Card>

                            <Card className="border border-border bg-card">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Select Technician</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-2">
                                    {technicians.length === 0 ? (
                                        <Text className="text-sm text-muted-foreground">No technicians available.</Text>
                                    ) : (
                                        technicians.map((tech) => {
                                            const selected = selectedTechnicianId === tech.id;
                                            return (
                                                <Pressable
                                                    key={tech.id}
                                                    onPress={() => {
                                                        setSelectedTechnician(tech.name);
                                                        setSelectedTechnicianId(tech.id);
                                                    }}
                                                    className={`rounded-xl border px-3 py-3 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                                                >
                                                    <Text className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{tech.name}</Text>
                                                    {tech.email ? <Text className="text-xs text-muted-foreground">{tech.email}</Text> : null}
                                                </Pressable>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>

                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => bottomSheetModalRef.current?.dismiss()}
                                    className="flex-1 items-center rounded-xl border border-border bg-card py-3"
                                >
                                    <Text className="font-semibold text-foreground">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleConfirmTechnician}
                                    disabled={!selectedTechnicianId || assignTechnician.isPending}
                                    className={`flex-1 items-center rounded-xl py-3 ${!selectedTechnicianId || assignTechnician.isPending ? 'bg-primary/40' : 'bg-primary'}`}
                                >
                                    <Text className="font-semibold text-white">{assignTechnician.isPending ? 'Assigning...' : 'Assign'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}
                </BottomSheetScrollView>
            </BottomSheetModal>
        </ScrollView>
    );
}