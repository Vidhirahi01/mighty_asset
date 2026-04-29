import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Check, ChevronDown, ChevronUp, ShoppingCart, X } from 'lucide-react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useApproveReturnRequest, useManagerRequests, useUpdateWorkflowRequestStatus } from '@/hooks/queries/useRequests';
import { useReturnRequests } from '@/hooks/queries/useReturnRequests';

type ApprovalKind = 'asset' | 'return';

type ApprovalRequest = {
    id: string;
    kind: ApprovalKind;
    userName: string;
    userEmail: string;
    assetName: string;
    assetCategory: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
    submittedAt: string;
    requiredBy?: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Purchase Pending' | 'Returned';
    createdAt?: string;
};

const normalizeStatus = (status: string | null): ApprovalRequest['status'] => {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'PURCHASE_PENDING') return 'Purchase Pending';
    if (status === 'RETURNED') return 'Returned';
    return 'Pending';
};

const getTimeAgo = (value: string) => {
    const timestamp = new Date(value).getTime();
    const diffMs = Date.now() - timestamp;
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

const parseLine = (reason: string | null, prefix: string) => {
    const text = reason ?? '';
    const line = text.split('\n').find((item) => item.startsWith(prefix));
    return line ? line.replace(prefix, '').trim() : '';
};

const parseReasonSummary = (reason: string | null) => {
    const title = parseLine(reason, 'Title: ');
    return title || (reason ?? '').trim() || 'No reason provided';
};

const parsePriority = (reason: string | null): ApprovalRequest['priority'] => {
    const priority = parseLine(reason, 'Priority: ').toLowerCase();
    if (priority === 'high') return 'High';
    if (priority === 'low') return 'Low';
    return 'Medium';
};

const parseRequiredBy = (reason: string | null) => {
    const value = parseLine(reason, 'Expected Duration: ');
    return value || 'Not specified';
};

const parseReturnReason = (reason: string | null) => {
    const value = parseLine(reason, 'Reason: ');
    return value || 'No reason provided';
};

const parseReturnCondition = (reason: string | null) => {
    const value = parseLine(reason, 'Condition: ');
    return value || 'Not specified';
};

export default function ApprovalsScreen() {
    const { data: managerRows = [], isLoading: isAssetLoading } = useManagerRequests();
    const { data: returnRows = [], isLoading: isReturnLoading } = useReturnRequests();
    const updateStatusMutation = useUpdateWorkflowRequestStatus();
    const approveReturnMutation = useApproveReturnRequest();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const approvals: ApprovalRequest[] = useMemo(() => {
        const assetApprovals = managerRows.map((row) => ({
            id: row.id,
            kind: 'asset' as const,
            userName: row.email?.split('@')[0] || 'Employee',
            userEmail: row.email || 'unknown@company.com',
            assetName: `${row.category || 'asset'}${row.quantity ? ` x${row.quantity}` : ''}`,
            assetCategory: row.category || 'Uncategorized',
            reason: parseReasonSummary(row.reason),
            priority: parsePriority(row.reason),
            submittedAt: getTimeAgo(row.created_at),
            requiredBy: parseRequiredBy(row.reason),
            status: normalizeStatus(row.status),
            createdAt: row.created_at,
        }));

        const returnApprovals = returnRows.map((row) => ({
            id: row.id,
            kind: 'return' as const,
            userName: row.email?.split('@')[0] || 'Employee',
            userEmail: row.email || 'unknown@company.com',
            assetName: row.asset_name || row.category || 'Returned asset',
            assetCategory: row.category || 'Uncategorized',
            reason: parseReturnReason(row.reason),
            priority: 'Medium' as const,
            submittedAt: getTimeAgo(row.created_at),
            requiredBy: parseReturnCondition(row.reason),
            status: normalizeStatus(row.status),
            createdAt: row.created_at,
        }));

        return [...assetApprovals, ...returnApprovals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [managerRows, returnRows]);

    const handleApprove = (item: ApprovalRequest) => {
        const message = item.kind === 'return'
            ? 'Approve this return request and mark the asset available again?'
            : 'Are you sure you want to approve this request?';

        Alert.alert('Approve Request', message, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: async () => {
                    if (item.kind === 'return') {
                        await approveReturnMutation.mutateAsync({ requestId: item.id });
                        Alert.alert('Success', 'Return approved and asset marked available.');
                    } else {
                        await updateStatusMutation.mutateAsync({ requestId: item.id, status: 'APPROVED' });
                        Alert.alert('Success', 'Request approved!');
                    }
                    setExpandedId(null);
                },
                style: 'default',
            },
        ]);
    };

    const handleReject = (item: ApprovalRequest) => {
        Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                onPress: async () => {
                    await updateStatusMutation.mutateAsync({ requestId: item.id, status: 'REJECTED' });
                    setExpandedId(null);
                    Alert.alert('Success', 'Request rejected!');
                },
                style: 'destructive',
            },
        ]);
    };

    const handleSendForPurchase = (item: ApprovalRequest) => {
        if (item.kind !== 'asset') return;

        Alert.alert('Send For Purchase', 'Mark this request for procurement and stock handling?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Send',
                onPress: async () => {
                    await updateStatusMutation.mutateAsync({ requestId: item.id, status: 'PURCHASE_PENDING' });
                    setExpandedId(null);
                    Alert.alert('Queued', 'Request sent to operations purchase queue.');
                },
            },
        ]);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return '#22c55e';
            case 'Rejected': return '#ef4444';
            case 'Purchase Pending': return '#0284c7';
            case 'Pending': return '#f59e0b';
            case 'Returned': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const FilterButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
        <Pressable onPress={onPress} className={`px-3 py-2 rounded-full ${active ? 'bg-primary' : 'bg-card'}`}>
            <Text className={`${active ? 'text-white' : 'text-foreground'}`}>{label}</Text>
        </Pressable>
    );

    const pendingAssetCount = approvals.filter((item) => item.kind === 'asset' && item.status === 'Pending').length;
    const pendingReturnCount = approvals.filter((item) => item.kind === 'return' && item.status === 'Pending').length;
    const approvedCount = approvals.filter((item) => item.status === 'Approved').length;
    const purchaseCount = approvals.filter((item) => item.status === 'Purchase Pending').length;
    const returnedCount = approvals.filter((item) => item.status === 'Returned').length;
    const isLoading = isAssetLoading || isReturnLoading;
    const [filter, setFilter] = useState<'all' | 'asset' | 'return'>('all');

    const visibleApprovals = approvals.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'asset') return item.kind === 'asset';
        return item.kind === 'return';
    });

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View className="flex-row flex-wrap justify-between gap-y-2">
                    <Card className="w-[49%] bg-warning/10 border border-warning/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-warning text-xs opacity-80">Pending</Text>
                            <Text className="text-warning text-2xl font-bold mt-1">{pendingAssetCount}</Text>
                        </CardContent>
                    </Card>
                    <Card className="w-[49%] bg-sky-500/10 border border-sky-500/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-sky-700 text-xs opacity-80">Returns</Text>
                            <Text className="text-sky-700 text-2xl font-bold mt-1">{pendingReturnCount}</Text>
                        </CardContent>
                    </Card>
                    <Card className="w-[49%] bg-success/10 border border-success/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-success text-xs opacity-80">Approved</Text>
                            <Text className="text-success text-2xl font-bold mt-1">{approvedCount}</Text>
                        </CardContent>
                    </Card>
                    <Card className="w-[49%] bg-destructive/10 border border-destructive/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-destructive text-xs opacity-80">Purchase</Text>
                            <Text className="text-destructive text-2xl font-bold mt-1">{purchaseCount}</Text>
                        </CardContent>
                    </Card>
                </View>

                <View className="flex-row items-center gap-2 mt-2 mb-2">
                    <FilterButton label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                    <FilterButton label="Asset Requests" active={filter === 'asset'} onPress={() => setFilter('asset')} />
                    <FilterButton label="Return Requests" active={filter === 'return'} onPress={() => setFilter('return')} />
                </View>

                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Approval Requests</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Review manager requests and return requests together.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Text className="mb-3 text-sm text-foreground/60">Loading requests...</Text> : null}

                        <View className="gap-3">
                            {visibleApprovals.map((item) => (
                                <View key={item.id} className="mb-1">
                                    <Pressable
                                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        className="active:opacity-70"
                                    >
                                        <View className="bg-card/50 border border-border/50 rounded-lg p-4">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-2">
                                                    <View className="flex-row items-center gap-2 flex-wrap">
                                                        <Text className="text-foreground font-semibold text-sm">{item.userName}</Text>
                                                        <View className="rounded-full bg-primary/10 px-2 py-0.5">
                                                            <Text className="text-primary text-[10px] font-semibold uppercase tracking-wide">
                                                                {item.kind === 'return' ? 'Return' : 'Asset'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-foreground/60 text-xs mt-1">{item.assetName}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <View style={{ backgroundColor: getPriorityColor(item.priority) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                                                        <Text style={{ color: getPriorityColor(item.priority), fontSize: 11, fontWeight: '600' }}>{item.priority}</Text>
                                                    </View>
                                                    {expandedId === item.id ? (
                                                        <ChevronUp size={18} color="#6b7280" strokeWidth={2} />
                                                    ) : (
                                                        <ChevronDown size={18} color="#6b7280" strokeWidth={2} />
                                                    )}
                                                </View>
                                            </View>
                                            <View className="flex-row items-center justify-between mt-3">
                                                <Text className="text-foreground/50 text-xs">{item.submittedAt}</Text>
                                                <View style={{ backgroundColor: getStatusColor(item.status) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                                                    <Text style={{ color: getStatusColor(item.status), fontSize: 11, fontWeight: '600' }}>{item.status}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>

                                    {expandedId === item.id && item.status === 'Pending' && (
                                        <View className="bg-primary/5 border border-primary/20 rounded-b-lg p-4 mt-0">
                                            <View className="gap-3">
                                                <View className="gap-2">
                                                    <View>
                                                        <Text className="text-foreground/60 text-xs">Email</Text>
                                                        <Text className="text-foreground font-medium text-sm mt-1">{item.userEmail}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-foreground/60 text-xs">Category</Text>
                                                        <Text className="text-foreground font-medium text-sm mt-1">{item.assetCategory}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-foreground/60 text-xs">Reason</Text>
                                                        <Text className="text-foreground font-medium text-sm mt-1">{item.reason}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-foreground/60 text-xs">Required By</Text>
                                                        <Text className="text-foreground font-medium text-sm mt-1">{item.requiredBy}</Text>
                                                    </View>
                                                </View>

                                                <View className="gap-3 mt-4">
                                                    <View className="flex-row gap-2">
                                                        <Pressable onPress={() => handleApprove(item)} className="flex-1 active:opacity-70">
                                                            <View className="bg-success/10 border border-success/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                <Check size={18} color="#22c55e" strokeWidth={2} />
                                                                <Text className="text-success font-semibold text-sm">Approve</Text>
                                                            </View>
                                                        </Pressable>
                                                        <Pressable onPress={() => handleReject(item)} className="flex-1 active:opacity-70">
                                                            <View className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                <X size={18} color="#ef4444" strokeWidth={2} />
                                                                <Text className="text-destructive font-semibold text-sm">Reject</Text>
                                                            </View>
                                                        </Pressable>
                                                    </View>
                                                    {item.kind === 'asset' ? (
                                                        <Pressable onPress={() => handleSendForPurchase(item)} className="active:opacity-70">
                                                            <View className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                <ShoppingCart size={18} color="#0284c7" strokeWidth={2} />
                                                                <Text className="text-sky-700 font-semibold text-sm">Send for Purchase</Text>
                                                            </View>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {expandedId === item.id && item.status !== 'Pending' && (
                                        <View className="bg-foreground/5 border border-foreground/10 rounded-b-lg p-4 mt-0">
                                            <Text className="text-foreground/60 text-sm">
                                                This request has already been {item.status.toLowerCase()}.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </CardContent>
                </Card>
            </View>
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
