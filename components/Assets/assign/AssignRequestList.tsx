import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { AssetRequest, RequestPriority } from './types';

type AssignRequestListProps = {
    requests: AssetRequest[];
    selectedRequestId: string | null;
    onSelectRequest: (request: AssetRequest) => void;
};

const priorityWeight: Record<RequestPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};

const priorityLabel = (priority: RequestPriority) => {
    if (priority === 'high') return 'High';
    if (priority === 'medium') return 'Medium';
    return 'Low';
};

const priorityClass = (priority: RequestPriority) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-amber-500';
    return 'bg-emerald-600';
};

export function AssignRequestList({ requests, selectedRequestId, onSelectRequest }: AssignRequestListProps) {
    const sortedRequests = useMemo(
        () =>
            [...requests].sort((a, b) => {
                const byPriority = priorityWeight[b.priority] - priorityWeight[a.priority];
                if (byPriority !== 0) return byPriority;
                return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
            }),
        [requests]
    );

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">Incoming Requests</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
                {sortedRequests.length === 0 ? (
                    <View className="rounded-xl border border-dashed border-border p-4">
                        <Text className="text-center text-sm text-muted-foreground">No approved requests ready for assignment.</Text>
                    </View>
                ) : null}
                {sortedRequests.map((request) => {
                    const selected = request.id === selectedRequestId;
                    return (
                        <Pressable
                            key={request.id}
                            onPress={() => onSelectRequest(request)}
                            className={`rounded-xl p-3 ${selected ? 'bg-primary/10' : 'bg-background/70'}`}>
                            <View className="mb-2 flex-row items-start justify-between gap-2">
                                <Text className="flex-1 text-sm font-semibold text-foreground">{request.requesterName}</Text>
                                <View className={`rounded-full px-2 py-1 ${priorityClass(request.priority)}`}>
                                    <Text className="text-[10px] font-bold text-white">{priorityLabel(request.priority)}</Text>
                                </View>
                            </View>
                            <Text className="text-xs text-muted-foreground">Emp ID: {request.employeeId} | {request.department}</Text>
                            <Text className="text-xs text-muted-foreground">Role: {request.role}</Text>
                            <Text className="text-xs text-muted-foreground">Qty Requested: {request.quantity}</Text>
                            <Text className="mt-1 text-xs text-foreground/80">{request.reason}</Text>
                            <Text className="mt-1 text-xs text-foreground/70">Preferred: {request.preferredCategory}</Text>
                        </Pressable>
                    );
                })}
            </CardContent>
        </Card>
    );
}
