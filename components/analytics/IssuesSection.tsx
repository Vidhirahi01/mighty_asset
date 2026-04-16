import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react-native';
import { IssueCard, TeamIssue } from './IssueCard';

interface IssuesSectionProps {
    issues: TeamIssue[];
    mode?: 'manager' | 'operations';
    onAssignTechnician?: (issueId: string, technicianName: string) => void;
    onStatusChange?: (issueId: string, status: TeamIssue['status']) => void;
}

export function IssuesSection({
    issues,
    mode = 'manager',
    onAssignTechnician,
    onStatusChange,
}: IssuesSectionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredIssues = {
        open: issues.filter(i => i.status === 'Open'),
        inProgress: issues.filter(i => i.status === 'In Progress'),
        resolved: issues.filter(i => i.status === 'Resolved'),
    };

    const handleToggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View>
            {/* Issue Stats */}
            <View className="flex-row gap-3 mb-4">
                <Card className="flex-1 bg-danger/10 border border-danger">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-danger">{filteredIssues.open.length}</Text>
                        <Text className="text-xs text-foreground/60">Open</Text>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-info/10 border border-info">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-info">{filteredIssues.inProgress.length}</Text>
                        <Text className="text-xs text-foreground/60">In Progress</Text>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-success/10 border border-success">
                    <CardContent className="pt-4">
                        <Text className="text-2xl font-bold text-success">{filteredIssues.resolved.length}</Text>
                        <Text className="text-xs text-foreground/60">Resolved</Text>
                    </CardContent>
                </Card>
            </View>

            {/* Open Issues */}
            {filteredIssues.open.length > 0 && (
                <>
                    <Text className="text-base font-bold mb-3 text-foreground flex-row items-center gap-2">
                        <AlertCircle size={16} className="text-danger" /> Open Issues
                    </Text>
                    {filteredIssues.open.map(issue => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            expandedId={expandedId}
                            onToggleExpand={handleToggleExpand}
                            mode={mode}
                            onAssignTechnician={onAssignTechnician}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </>
            )}

            {/* In Progress Issues */}
            {filteredIssues.inProgress.length > 0 && (
                <>
                    <Text className="text-base font-bold mb-3 mt-6 text-foreground">In Progress Issues</Text>
                    {filteredIssues.inProgress.map(issue => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            expandedId={expandedId}
                            onToggleExpand={handleToggleExpand}
                            mode={mode}
                            onAssignTechnician={onAssignTechnician}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </>
            )}

            {/* Resolved Issues */}
            {filteredIssues.resolved.length > 0 && (
                <>
                    <Text className="text-base font-bold mb-3 mt-6 text-foreground/50">Resolved Issues</Text>
                    {filteredIssues.resolved.map(issue => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            expandedId={expandedId}
                            onToggleExpand={handleToggleExpand}
                            mode={mode}
                            onAssignTechnician={onAssignTechnician}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </>
            )}
        </View>
    );
}
