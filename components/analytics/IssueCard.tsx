import React, { useState } from 'react';
import { View, Pressable, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown, ChevronUp, ArrowUp } from 'lucide-react-native';

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
}

export function IssueCard({ issue, expandedId, onToggleExpand }: IssueCardProps) {
    const [escalatingId, setEscalatingId] = useState<string | null>(null);
    const [escalationReason, setEscalationReason] = useState('');
    const [escalationLevel, setEscalationLevel] = useState<'Level 1' | 'Level 2' | 'Level 3'>('Level 1');
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

    const handleEscalate = () => {
        if (!escalationReason.trim()) {
            Alert.alert('Error', 'Please enter an escalation reason');
            return;
        }

        Alert.alert('Success', `Issue escalated to ${escalationLevel} with reason: "${escalationReason}"`);
        setEscalatingId(null);
        setEscalationReason('');
    };

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

                    {escalatingId === issue.id ? (
                        <View className="gap-3 mb-3">
                            <View>
                                <Text className="text-xs font-semibold text-foreground mb-2">Escalation Level</Text>
                                <View className="flex-row gap-2">
                                    {(['Level 1', 'Level 2', 'Level 3'] as const).map(level => (
                                        <Pressable
                                            key={level}
                                            onPress={() => setEscalationLevel(level)}
                                            className={`flex-1 py-2 px-3 rounded-lg border ${escalationLevel === level
                                                ? 'bg-warning border-warning'
                                                : 'bg-accent border-border'
                                                }`}
                                        >
                                            <Text className={`text-xs font-semibold text-center ${escalationLevel === level ? 'text-white' : 'text-foreground'}`}>
                                                {level}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-xs font-semibold text-foreground mb-2">Escalation Reason</Text>
                                <TextInput
                                    placeholder="Explain why this needs escalation..."
                                    placeholderTextColor="#999"
                                    value={escalationReason}
                                    onChangeText={setEscalationReason}
                                    multiline
                                    className="bg-background border border-border rounded-lg p-3 text-foreground text-sm min-h-[80px]"
                                />
                            </View>

                            <View className="flex-row gap-2">
                                <Pressable
                                    onPress={() => {
                                        setEscalatingId(null);
                                        setEscalationReason('');
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-accent border border-border"
                                >
                                    <Text className="text-center text-sm font-semibold text-foreground">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleEscalate}
                                    disabled={!escalationReason.trim()}
                                    className="flex-1 py-2 rounded-lg bg-warning border border-warning disabled:opacity-50"
                                >
                                    <Text className="text-center text-sm font-semibold text-white">Escalate</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => setEscalatingId(issue.id)}
                            className="flex-row items-center justify-center gap-2 py-2 rounded-lg bg-warning/20 border border-warning"
                        >
                            <ArrowUp size={16} className="text-warning" />
                            <Text className="text-sm font-semibold text-warning">Escalate Issue</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    );
}
