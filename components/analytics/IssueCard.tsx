import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

export type TeamIssue = {
    id: string;
    title: string;
    description: string;
    reportedBy: string;
    reportedByEmail: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Resolved';
    reportedAt: string;
    assignedTo?: string;
};

interface IssueCardProps {
    issue: TeamIssue;
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
    mode?: 'manager' | 'operations';
    onAssignTechnician?: (issueId: string, technicianName: string) => void;
    onStatusChange?: (issueId: string, status: TeamIssue['status']) => void;
}

const TECHNICIAN_POOL = ['Tech Support', 'IT Operations', 'Field Technician'];

export function IssueCard({
    issue,
    expandedId,
    onToggleExpand,
    mode = 'manager',
    onAssignTechnician,
    onStatusChange,
}: IssueCardProps) {
    const [selectedTechnician, setSelectedTechnician] = useState<string>(TECHNICIAN_POOL[0]);
    const isExpanded = expandedId === issue.id;

    const getPriorityBgColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-danger/10';
            case 'Medium': return 'bg-warning/10';
            case 'Low': return 'bg-success/10';
            default: return 'bg-accent/10';
        }
    };

    const getPriorityTextColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-danger';
            case 'Medium': return 'text-warning';
            case 'Low': return 'text-success';
            default: return 'text-foreground';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-danger/20';
            case 'In Progress': return 'bg-info/20';
            case 'Resolved': return 'bg-success/20';
            default: return 'bg-accent/20';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Open': return 'text-danger';
            case 'In Progress': return 'text-info';
            case 'Resolved': return 'text-success';
            default: return 'text-foreground';
        }
    };

    const isOperationsMode = mode === 'operations';

    const canMoveToInProgress = issue.status === 'Open' && Boolean(issue.assignedTo);
    const canResolve = issue.status === 'In Progress';
    const canReopen = issue.status === 'Resolved';

    return (
        <View className="mb-3">
            <Pressable
                onPress={() => onToggleExpand(issue.id)}
                className={`rounded-lg border p-4 ${getPriorityBgColor(issue.priority)} border-border/30`}
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Text className="font-bold text-base flex-1 text-foreground">{issue.title}</Text>
                            <View className={`rounded-full px-2 py-1 ${getStatusBgColor(issue.status)}`}>
                                <Text className={`text-xs font-semibold ${getStatusTextColor(issue.status)}`}>
                                    {issue.status}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <Text className={`text-xs font-semibold ${getPriorityTextColor(issue.priority)}`}>
                                {issue.priority} Priority
                            </Text>
                            <Text className="text-xs text-foreground/50">{issue.reportedAt}</Text>
                        </View>
                    </View>
                    {isExpanded ? (
                        <ChevronUp size={20} className="text-foreground/50" />
                    ) : (
                        <ChevronDown size={20} className="text-foreground/50" />
                    )}
                </View>
            </Pressable>

            {isExpanded && (
                <View className="bg-accent/30 rounded-b-lg p-4 border border-t-0 border-border/30">
                    <Text className="text-foreground/70 text-sm mb-3">{issue.description}</Text>

                    <View className="bg-background rounded-lg p-3 mb-4 gap-2 border border-border/20">
                        <Text className="text-xs text-foreground/60">
                            <Text className="font-semibold">Reported by: </Text>
                            {issue.reportedBy} ({issue.reportedByEmail})
                        </Text>
                        <Text className="text-xs text-foreground/60">
                            <Text className="font-semibold">Category: </Text>
                            {issue.category}
                        </Text>
                        {issue.assignedTo && (
                            <Text className="text-xs text-foreground/60">
                                <Text className="font-semibold">Assigned to: </Text>
                                {issue.assignedTo}
                            </Text>
                        )}
                    </View>

                    {isOperationsMode ? (
                        <View className="gap-3">
                            <View>
                                <Text className="text-xs font-semibold text-foreground mb-2">Assign Technician</Text>
                                <View className="flex-row gap-2">
                                    {TECHNICIAN_POOL.map((technician) => {
                                        const isSelected = selectedTechnician === technician;
                                        return (
                                            <Pressable
                                                key={technician}
                                                onPress={() => setSelectedTechnician(technician)}
                                                className={`flex-1 rounded-lg border px-2 py-2 ${isSelected ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                                            >
                                                <Text className={`text-center text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                    {technician}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                <Pressable
                                    onPress={() => onAssignTechnician?.(issue.id, selectedTechnician)}
                                    className="mt-2 rounded-lg border border-primary bg-primary/10 py-2"
                                >
                                    <Text className="text-center text-sm font-semibold text-primary">Assign Selected Technician</Text>
                                </Pressable>
                            </View>

                            <View className="gap-2">
                                <Text className="text-xs font-semibold text-foreground">Progress Actions</Text>
                                <View className="flex-row gap-2">
                                    <Pressable
                                        disabled={!canMoveToInProgress}
                                        onPress={() => onStatusChange?.(issue.id, 'In Progress')}
                                        className="flex-1 rounded-lg border border-info bg-info/15 py-2 disabled:opacity-40"
                                    >
                                        <Text className="text-center text-sm font-semibold text-info">Start Progress</Text>
                                    </Pressable>
                                    <Pressable
                                        disabled={!canResolve}
                                        onPress={() => onStatusChange?.(issue.id, 'Resolved')}
                                        className="flex-1 rounded-lg border border-success bg-success/15 py-2 disabled:opacity-40"
                                    >
                                        <Text className="text-center text-sm font-semibold text-success">Mark Resolved</Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    disabled={!canReopen}
                                    onPress={() => onStatusChange?.(issue.id, 'Open')}
                                    className="rounded-lg border border-warning bg-warning/15 py-2 disabled:opacity-40"
                                >
                                    <Text className="text-center text-sm font-semibold text-warning">Reopen Issue</Text>
                                </Pressable>
                                {!issue.assignedTo && issue.status === 'Open' && (
                                    <Text className="text-[11px] text-foreground/60">Assign a technician before moving to In Progress.</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View className="rounded-lg border border-border/40 bg-card/60 p-3">
                            <Text className="text-xs text-foreground/70">
                                Manager view is monitor-only. Operations team handles assignment and progress updates.
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
