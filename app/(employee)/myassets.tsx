import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { CalendarClock, ChevronDown, ChevronUp, CircleCheck, Package } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeAssetRequests, useEmployeeAssignedAssets } from '@/hooks/queries/useRequests';

type ParsedReason = {
    title: string;
    priority: string;
    expectedDuration: string;
    additionalNotes: string;
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

const parseReason = (value: string | null): ParsedReason => {
    const text = value ?? '';
    const lines = text.split('\n');
    const get = (prefix: string, fallback: string) => {
        const line = lines.find((item) => item.startsWith(prefix));
        return line ? line.replace(prefix, '').trim() : fallback;
    };

    return {
        title: get('Title: ', 'No title provided'),
        priority: get('Priority: ', 'Not specified'),
        expectedDuration: get('Expected Duration: ', 'Not specified'),
        additionalNotes: get('Additional Notes: ', 'None'),
    };
};

const normalizeStatusLabel = (value: string) => {
    const normalized = value.toUpperCase();
    if (normalized === 'PURCHASE_PENDING') return 'Purchase Pending';
    if (normalized === 'APPROVED') return 'Approved';
    if (normalized === 'REJECTED') return 'Rejected';
    return 'Pending';
};

const statusChipClass = (value: string) => {
    const normalized = value.toUpperCase();
    if (normalized === 'APPROVED') return 'bg-green-100';
    if (normalized === 'REJECTED') return 'bg-red-100';
    if (normalized === 'PURCHASE_PENDING') return 'bg-sky-100';
    return 'bg-amber-100';
};

export default function MyAssets() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const user = useAuthStore((state) => state.user);

    const { data: assets = [], isLoading } = useEmployeeAssignedAssets(user?.id, user?.email);
    const { data: requestHistory = [], isLoading: isLoadingRequests } = useEmployeeAssetRequests(user?.id, user?.email);

    const normalizedAssets = useMemo(
        () => assets.map((asset) => ({
            ...asset,
            categoryLabel: toTitle(asset.category || 'uncategorized'),
            approvedDate: prettyDate(asset.approvedAt),
            reasonMeta: parseReason(asset.reason),
        })),
        [assets]
    );

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View>
                    <Text className="text-foreground text-2xl font-bold">My Assets</Text>
                    <Text className="text-foreground/60 text-sm mt-1">
                        Final assigned assets and full request tracking
                    </Text>
                </View>

                <Card className="bg-card border border-border rounded-xl">
                    <CardContent className="py-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Package size={18} color="#1b72fc" strokeWidth={2} />
                            <Text className="text-foreground text-sm font-semibold">Assigned Assets</Text>
                        </View>
                        <Text className="text-primary text-lg font-bold">{normalizedAssets.length}</Text>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">View Assets</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Tap any asset to expand details in a dedicated card
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="gap-3">
                        {isLoading ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator color="#1b72fc" />
                                <Text className="text-foreground/60 text-sm mt-3">Loading your assets...</Text>
                            </View>
                        ) : normalizedAssets.length === 0 ? (
                            <View className="py-6 items-center">
                                <Text className="text-foreground/50 text-sm text-center">
                                    No assigned assets yet. Once operations assigns an asset, it will appear here.
                                </Text>
                            </View>
                        ) : (
                            normalizedAssets.map((asset) => {
                                const isExpanded = expandedId === asset.requestId;

                                return (
                                    <View key={asset.requestId}>
                                        <Pressable
                                            onPress={() => setExpandedId(isExpanded ? null : asset.requestId)}
                                            className="rounded-lg border border-border p-3 bg-background active:opacity-80"
                                        >
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-3">
                                                    <Text className="text-foreground text-sm font-semibold">
                                                        {toTitle(asset.assetName)}
                                                    </Text>
                                                    <Text className="text-foreground/60 text-xs mt-1">
                                                        {asset.categoryLabel} • Qty: {asset.quantity}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <View className="rounded-full bg-success/15 px-2 py-1">
                                                        <Text className="text-success text-[10px] font-semibold">ASSIGNED</Text>
                                                    </View>
                                                    {isExpanded ? (
                                                        <ChevronUp size={16} color="#6b7280" strokeWidth={2} />
                                                    ) : (
                                                        <ChevronDown size={16} color="#6b7280" strokeWidth={2} />
                                                    )}
                                                </View>
                                            </View>
                                        </Pressable>

                                        {isExpanded ? (
                                            <Card className="mt-2 bg-primary/5 border border-primary/20 rounded-lg">
                                                <CardContent className="py-4 gap-3">
                                                    <View className="flex-row items-center gap-2">
                                                        <CircleCheck size={15} color="#16a34a" strokeWidth={2.5} />
                                                        <Text className="text-success text-xs font-semibold">
                                                            Asset assignment completed by operations
                                                        </Text>
                                                    </View>

                                                    <View className="rounded-lg border border-border/60 bg-card p-3 gap-2">
                                                        <Text className="text-foreground/60 text-xs">Request Title</Text>
                                                        <Text className="text-foreground text-sm font-medium">{asset.reasonMeta.title}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Priority</Text>
                                                        <Text className="text-foreground text-sm">{asset.reasonMeta.priority}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Expected Duration</Text>
                                                        <Text className="text-foreground text-sm">{asset.reasonMeta.expectedDuration}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Additional Notes</Text>
                                                        <Text className="text-foreground text-sm">{asset.reasonMeta.additionalNotes}</Text>
                                                    </View>

                                                    <View className="rounded-lg border border-border/60 bg-card p-3 gap-2">
                                                        <Text className="text-foreground/60 text-xs">Category</Text>
                                                        <Text className="text-foreground text-sm">{asset.categoryLabel}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Brand</Text>
                                                        <Text className="text-foreground text-sm">{asset.brand || 'N/A'}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Model</Text>
                                                        <Text className="text-foreground text-sm">{asset.modelNo || 'N/A'}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Condition</Text>
                                                        <Text className="text-foreground text-sm">{asset.condition || 'N/A'}</Text>

                                                        <Text className="text-foreground/60 text-xs mt-1">Asset Note</Text>
                                                        <Text className="text-foreground text-sm">{asset.note || 'N/A'}</Text>
                                                    </View>

                                                    <View className="flex-row items-center gap-2">
                                                        <CalendarClock size={14} color="#6b7280" strokeWidth={2} />
                                                        <Text className="text-foreground/60 text-xs">
                                                            Approved on {asset.approvedDate}
                                                        </Text>
                                                    </View>
                                                </CardContent>
                                            </Card>
                                        ) : null}
                                    </View>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">My Requests</CardTitle>
                        <CardDescription className="text-foreground/60">
                            All asset requests with current status and assigned asset details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="gap-3">
                        {isLoadingRequests ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator color="#1b72fc" />
                                <Text className="text-foreground/60 text-sm mt-3">Loading request history...</Text>
                            </View>
                        ) : requestHistory.length === 0 ? (
                            <View className="py-6 items-center">
                                <Text className="text-foreground/50 text-sm text-center">
                                    No asset requests found for your account.
                                </Text>
                            </View>
                        ) : (
                            requestHistory.map((request) => (
                                <View key={request.requestId} className="rounded-lg border border-border p-3 bg-background">
                                    <View className="flex-row items-start justify-between gap-3">
                                        <View className="flex-1">
                                            <Text className="text-foreground text-sm font-semibold">
                                                {request.assignedAssetName || toTitle(request.category || 'asset request')}
                                            </Text>
                                            <Text className="text-foreground/60 text-xs mt-1">
                                                {toTitle(request.category || 'uncategorized')} • Qty: {request.quantity}
                                            </Text>
                                            <Text className="text-foreground/60 text-xs mt-1">
                                                {prettyDate(request.createdAt)}
                                            </Text>
                                        </View>
                                        <View className={`rounded-full px-2 py-1 ${statusChipClass(request.status)}`}>
                                            <Text className="text-[10px] font-semibold text-foreground">
                                                {normalizeStatusLabel(request.status)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-foreground/70 text-xs mt-2">
                                        Assigned Asset: {request.assignedAssetName || 'Not assigned yet'}
                                    </Text>
                                </View>
                            ))
                        )}
                    </CardContent>
                </Card>

                <View style={{ height: 160 }} />
            </View>
        </ScrollView>
    );
}