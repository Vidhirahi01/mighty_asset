import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowUp, ChevronDown, ChevronUp, TrendingUp, Users, Clock, Target, BarChart3, Gauge } from 'lucide-react-native';

// Types for Issues
type TeamIssue = {
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

// Types for Performance
type TeamMember = {
    id: string;
    name: string;
    role: string;
    requestsProcessed: number;
    approvalRate: number;
    avgApprovalTime: string;
};

const TEAM_ISSUES: TeamIssue[] = [
    {
        id: '1',
        title: 'Server Connection Timeout',
        description: 'API calls timing out intermittently affecting workflow productivity.',
        reportedBy: 'Alice Chen',
        reportedByEmail: 'alice.chen@company.com',
        category: 'Technical',
        priority: 'High',
        status: 'Open',
        reportedAt: '3 hours ago',
        assignedTo: 'Tech Support',
    },
    {
        id: '2',
        title: 'Missing VPN Access',
        description: 'New team member unable to access corporate VPN after account setup.',
        reportedBy: 'Bob Wilson',
        reportedByEmail: 'bob.wilson@company.com',
        category: 'Access',
        priority: 'High',
        status: 'In Progress',
        reportedAt: '5 hours ago',
        assignedTo: 'IT Operations',
    },
    {
        id: '3',
        title: 'Software License Expiry',
        description: 'Design software license expiring next week. Renewal order needed.',
        reportedBy: 'Carol Davis',
        reportedByEmail: 'carol.davis@company.com',
        category: 'Licensing',
        priority: 'Medium',
        status: 'Open',
        reportedAt: '1 day ago',
    },
];

const TEAM_PERFORMANCE: TeamMember[] = [
    {
        id: '1',
        name: 'Alice Chen',
        role: 'Manager',
        requestsProcessed: 287,
        approvalRate: 78,
        avgApprovalTime: '2h 15min',
    },
    {
        id: '2',
        name: 'Bob Wilson',
        role: 'Senior Coordinator',
        requestsProcessed: 156,
        approvalRate: 82,
        avgApprovalTime: '1h 45min',
    },
    {
        id: '3',
        name: 'Carol Davis',
        role: 'Coordinator',
        requestsProcessed: 134,
        approvalRate: 76,
        avgApprovalTime: '2h 30min',
    },
];

export default function AnalyticsScreen() {
    const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
    const [escalatingId, setEscalatingId] = useState<string | null>(null);
    const [escalationReason, setEscalationReason] = useState('');
    const [escalationLevel, setEscalationLevel] = useState<'Level 1' | 'Level 2' | 'Level 3'>('Level 1');
    const [activeTab, setActiveTab] = useState<'issues' | 'performance'>('issues');

    const priorityColors = {
        High: 'danger',
        Medium: 'warning',
        Low: 'success',
    };

    const statusColors = {
        Open: 'danger',
        'In Progress': 'info',
        Resolved: 'success',
    };

    const handleEscalate = (issueId: string) => {
        const issue = TEAM_ISSUES.find(i => i.id === issueId);
        if (!issue || !escalationReason.trim()) return;

        Alert.alert('Success', `Issue escalated to ${escalationLevel} with reason: "${escalationReason}"`);
        setEscalatingId(null);
        setEscalationReason('');
    };

    const filteredIssues = {
        open: TEAM_ISSUES.filter(i => i.status === 'Open'),
        inProgress: TEAM_ISSUES.filter(i => i.status === 'In Progress'),
        resolved: TEAM_ISSUES.filter(i => i.status === 'Resolved'),
    };

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

    // Issues Section
    const IssueCard = ({ issue }: { issue: TeamIssue }) => (
        <View key={issue.id} className="mb-3">
            <Pressable
                onPress={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
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
                    {expandedIssueId === issue.id ? (
                        <ChevronUp size={20} className="text-foreground/50" />
                    ) : (
                        <ChevronDown size={20} className="text-foreground/50" />
                    )}
                </View>
            </Pressable>

            {expandedIssueId === issue.id && (
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
                                    onPress={() => handleEscalate(issue.id)}
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

    // Performance Section
    const TeamMemberCard = ({ member }: { member: TeamMember }) => (
        <Card className="bg-card border border-border mb-3">
            <CardContent className="pt-4">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className="font-bold text-base text-foreground">{member.name}</Text>
                        <Text className="text-xs text-foreground/60">{member.role}</Text>
                    </View>
                    <View className="bg-success/20 rounded-lg px-2 py-1 border border-success">
                        <Text className="text-sm font-bold text-success">{member.approvalRate}%</Text>
                    </View>
                </View>

                <View className="space-y-2 gap-2">
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-foreground/60">Requests Processed:</Text>
                        <Text className="text-xs font-semibold text-foreground">{member.requestsProcessed}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-foreground/60">Avg Approval Time:</Text>
                        <Text className="text-xs font-semibold text-foreground">{member.avgApprovalTime}</Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View className="mt-3 h-1.5 bg-accent rounded-full overflow-hidden">
                    <View
                        style={{ width: `${member.approvalRate}%` }}
                        className="h-full bg-success rounded-full"
                    />
                </View>
            </CardContent>
        </Card>
    );

    return (
        <ScrollView className="flex-1 bg-background pb-24" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Tab Toggle */}
                <View className="flex-row gap-2 bg-accent/50 rounded-lg p-1 border border-border/20">
                    <Pressable
                        onPress={() => setActiveTab('issues')}
                        className={`flex-1 py-3 rounded-md flex-row items-center justify-center gap-2 ${activeTab === 'issues' ? 'bg-primary' : ''}`}
                    >
                        <AlertCircle size={16} color={activeTab === 'issues' ? '#ffffff' : '#1a1a1a'} />
                        <Text className={`font-bold text-sm ${activeTab === 'issues' ? 'text-white' : 'text-foreground'}`}>
                            Issues
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('performance')}
                        className={`flex-1 py-3 rounded-md flex-row items-center justify-center gap-2 ${activeTab === 'performance' ? 'bg-primary' : ''}`}
                    >
                        <Gauge size={16} color={activeTab === 'performance' ? '#ffffff' : '#1a1a1a'} />
                        <Text className={`font-bold text-sm ${activeTab === 'performance' ? 'text-white' : 'text-foreground'}`}>
                            Performance
                        </Text>
                    </Pressable>
                </View>

                {/* Issues Tab Content */}
                {activeTab === 'issues' && (
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
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </>
                        )}

                        {/* In Progress Issues */}
                        {filteredIssues.inProgress.length > 0 && (
                            <>
                                <Text className="text-base font-bold mb-3 mt-6 text-foreground">In Progress Issues</Text>
                                {filteredIssues.inProgress.map(issue => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </>
                        )}

                        {/* Resolved Issues */}
                        {filteredIssues.resolved.length > 0 && (
                            <>
                                <Text className="text-base font-bold mb-3 mt-6 text-foreground/50">Resolved Issues</Text>
                                {filteredIssues.resolved.map(issue => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </>
                        )}
                    </View>
                )}

                {/* Performance Tab Content */}
                {activeTab === 'performance' && (
                    <View>
                        {/* Performance Metrics */}
                        <View className="flex-row gap-3 mb-4">
                            <Card className="flex-1 bg-primary/10 border border-primary">
                                <CardContent className="pt-4">
                                    <Text className="text-2xl font-bold text-primary">
                                        {TEAM_PERFORMANCE.reduce((sum, m) => sum + m.requestsProcessed, 0)}
                                    </Text>
                                    <Text className="text-xs text-foreground/60">Total Requests</Text>
                                </CardContent>
                            </Card>
                            <Card className="flex-1 bg-success/10 border border-success">
                                <CardContent className="pt-4">
                                    <Text className="text-2xl font-bold text-success">
                                        {Math.round(TEAM_PERFORMANCE.reduce((sum, m) => sum + m.approvalRate, 0) / TEAM_PERFORMANCE.length)}%
                                    </Text>
                                    <Text className="text-xs text-foreground/60">Avg Rate</Text>
                                </CardContent>
                            </Card>
                            <Card className="flex-1 bg-info/10 border border-info">
                                <CardContent className="pt-4">
                                    <Text className="text-2xl font-bold text-info">{TEAM_PERFORMANCE.length}</Text>
                                    <Text className="text-xs text-foreground/60">Team Size</Text>
                                </CardContent>
                            </Card>
                        </View>

                        <Text className="text-base font-bold mb-3 text-foreground">Team Performance</Text>
                        {TEAM_PERFORMANCE.map(member => (
                            <TeamMemberCard key={member.id} member={member} />
                        ))}

                        {/* Quick Insights */}
                        {/* <Card className="bg-warning/10 border border-warning mt-4">
                            <CardHeader>
                                <CardTitle className="text-base text-foreground">Quick Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <View className="gap-2">
                                    <View className="flex-row gap-2">
                                        <View className="w-1 bg-warning rounded-full" />
                                        <Text className="text-sm text-foreground/70 flex-1">
                                            Bob Wilson leads with 82% approval rate and fastest processing time.
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-2 mt-2">
                                        <View className="w-1 bg-danger rounded-full" />
                                        <Text className="text-sm text-foreground/70 flex-1">
                                            Team processed 577 requests with 79% average approval rate.
                                        </Text>
                                    </View>
                                </View>
                            </CardContent>
                        </Card> */}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
