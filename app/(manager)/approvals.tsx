import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';

type ApprovalRequest = {
    id: string;
    userName: string;
    userEmail: string;
    assetName: string;
    assetCategory: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
    submittedAt: string;
    requiredBy?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
};

const APPROVAL_REQUESTS: ApprovalRequest[] = [
    {
        id: '1',
        userName: 'John Smith',
        userEmail: 'john@company.com',
        assetName: 'Laptop Dell XPS 13',
        assetCategory: 'Laptops',
        reason: 'Need for new project work',
        priority: 'High',
        submittedAt: '2 hours ago',
        requiredBy: 'Today',
        status: 'Pending',
    },
    {
        id: '2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@company.com',
        assetName: 'Monitor LG 27"',
        assetCategory: 'Monitors',
        reason: 'Dual monitor setup requested',
        priority: 'Medium',
        submittedAt: '5 hours ago',
        requiredBy: '2 days',
        status: 'Pending',
    },
    {
        id: '3',
        userName: 'Mike Davis',
        userEmail: 'mike@company.com',
        assetName: 'Keyboard Mechanical RGB',
        assetCategory: 'Keyboards',
        reason: 'Replacement for damaged keyboard',
        priority: 'Low',
        submittedAt: '1 day ago',
        requiredBy: 'Week',
        status: 'Pending',
    },
    {
        id: '4',
        userName: 'Emma Wilson',
        userEmail: 'emma@company.com',
        assetName: 'USB-C Hub',
        assetCategory: 'Accessories',
        reason: 'For better connectivity',
        priority: 'Medium',
        submittedAt: '3 hours ago',
        requiredBy: 'Tomorrow',
        status: 'Pending',
    },
];

export default function ApprovalsScreen() {
    const [approvals, setApprovals] = useState(APPROVAL_REQUESTS);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [holdingRequestId, setHoldingRequestId] = useState<string | null>(null);
    const [holdMessage, setHoldMessage] = useState('');

    const handleApprove = (id: string) => {
        Alert.alert('Approve Request', 'Are you sure you want to approve this request?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: () => {
                    setApprovals(approvals.map(a =>
                        a.id === id ? { ...a, status: 'Approved' } : a
                    ));
                    setExpandedId(null);
                    Alert.alert('Success', 'Request approved!');
                },
                style: 'default',
            },
        ]);
    };

    const handleReject = (id: string) => {
        Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                onPress: () => {
                    setApprovals(approvals.map(a =>
                        a.id === id ? { ...a, status: 'Rejected' } : a
                    ));
                    setExpandedId(null);
                    Alert.alert('Success', 'Request rejected!');
                },
                style: 'destructive',
            },
        ]);
    };

    const handleHold = (id: string) => {
        const request = approvals.find(a => a.id === id);
        setHoldingRequestId(id);
        setHoldMessage('');
    };

    const handleSendMessage = () => {
        if (!holdMessage.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        const request = approvals.find(a => a.id === holdingRequestId);
        Alert.alert(
            'Message Sent',
            `Message sent to ${request?.userName}:\n\n"${holdMessage}"\n\nRequest is now on hold pending response.`
        );
        setHoldingRequestId(null);
        setHoldMessage('');
    };

    const handleCancelHold = () => {
        setHoldingRequestId(null);
        setHoldMessage('');
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
            case 'Pending': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const pendingCount = approvals.filter(a => a.status === 'Pending').length;

    return (
        <ScrollView className="flex-1 bg-background " showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                {/* Header Cards */}
                <View className="flex-row gap-2">
                    <Card className="flex-1 bg-warning/10 border border-warning/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-warning text-xs opacity-80">Pending</Text>
                            <Text className="text-warning text-2xl font-bold mt-1">{pendingCount}</Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 bg-success/10 border border-success/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-success text-xs opacity-80">Approved</Text>
                            <Text className="text-success text-2xl font-bold mt-1">
                                {approvals.filter(a => a.status === 'Approved').length}
                            </Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <CardContent className="px-4 py-3 items-center justify-center">
                            <Text className="text-destructive text-xs opacity-80">Rejected</Text>
                            <Text className="text-destructive text-2xl font-bold mt-1">
                                {approvals.filter(a => a.status === 'Rejected').length}
                            </Text>
                        </CardContent>
                    </Card>
                </View>

                {/* Approval Requests */}
                <Card className="bg-card border border-border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Approval Requests</CardTitle>
                        <CardDescription className="text-foreground/60">Click to view and manage requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlatList
                            data={approvals}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View key={item.id} className="mb-3">
                                    {/* Request Row */}
                                    <Pressable
                                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        className="active:opacity-70"
                                    >
                                        <View className="bg-card/50 border border-border/50 rounded-lg p-4">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1">
                                                    <Text className="text-foreground font-semibold text-sm">{item.userName}</Text>
                                                    <Text className="text-foreground/60 text-xs mt-1">{item.assetName}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <View style={{ backgroundColor: getPriorityColor(item.priority) + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                                                        <Text style={{ color: getPriorityColor(item.priority), fontSize: 11, fontWeight: '600' }}>
                                                            {item.priority}
                                                        </Text>
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
                                                    <Text style={{ color: getStatusColor(item.status), fontSize: 11, fontWeight: '600' }}>
                                                        {item.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>

                                    {/* Expanded Details */}
                                    {expandedId === item.id && item.status === 'Pending' && (
                                        <View className="bg-primary/5 border border-primary/20 rounded-b-lg p-4 mt-0">
                                            <View className="gap-3">
                                                {/* Details */}
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

                                                {/* Action Buttons */}
                                                {holdingRequestId !== item.id ? (
                                                    <View className="gap-3 mt-4">
                                                        <View className="flex-row gap-2">
                                                            <Pressable
                                                                onPress={() => handleApprove(item.id)}
                                                                className="flex-1 active:opacity-70"
                                                            >
                                                                <View className="bg-success/10 border border-success/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                    <Check size={18} color="#22c55e" strokeWidth={2} />
                                                                    <Text className="text-success font-semibold text-sm">Approve</Text>
                                                                </View>
                                                            </Pressable>
                                                            <Pressable
                                                                onPress={() => handleReject(item.id)}
                                                                className="flex-1 active:opacity-70"
                                                            >
                                                                <View className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                    <X size={18} color="#ef4444" strokeWidth={2} />
                                                                    <Text className="text-destructive font-semibold text-sm">Reject</Text>
                                                                </View>
                                                            </Pressable>
                                                        </View>
                                                        <Pressable
                                                            onPress={() => handleHold(item.id)}
                                                            className="active:opacity-70"
                                                        >
                                                            <View className="bg-warning/10 border border-warning/30 rounded-lg p-3 items-center flex-row justify-center gap-2">
                                                                <MessageSquare size={18} color="#f59e0b" strokeWidth={2} />
                                                                <Text className="text-warning font-semibold text-sm">Hold & Ask Info</Text>
                                                            </View>
                                                        </Pressable>
                                                    </View>
                                                ) : (
                                                    <View className="bg-warning/5 border border-warning/20 rounded-lg p-4 mt-4 gap-3">
                                                        <View>
                                                            <Text className="text-foreground font-semibold text-sm mb-2">Message to {item.userName}</Text>
                                                            <TextInput
                                                                placeholder="Ask for more information..."
                                                                placeholderTextColor="#9ca3af"
                                                                value={holdMessage}
                                                                onChangeText={setHoldMessage}
                                                                multiline
                                                                numberOfLines={4}
                                                                className="bg-card border border-border rounded-lg p-3 text-foreground text-sm"
                                                                style={{
                                                                    color: '#1f2937',
                                                                    textAlignVertical: 'top',
                                                                }}
                                                            />
                                                        </View>
                                                        <View className="flex-row gap-2">
                                                            <Pressable
                                                                onPress={handleSendMessage}
                                                                className="flex-1 active:opacity-70"
                                                            >
                                                                <View className="bg-warning/20 border border-warning/50 rounded-lg p-3 items-center">
                                                                    <Text className="text-warning font-semibold text-sm">Send Message</Text>
                                                                </View>
                                                            </Pressable>
                                                            <Pressable
                                                                onPress={handleCancelHold}
                                                                className="flex-1 active:opacity-70"
                                                            >
                                                                <View className="bg-foreground/5 border border-foreground/10 rounded-lg p-3 items-center">
                                                                    <Text className="text-foreground font-semibold text-sm">Cancel</Text>
                                                                </View>
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {/* Already Processed */}
                                    {expandedId === item.id && item.status !== 'Pending' && (
                                        <View className="bg-foreground/5 border border-foreground/10 rounded-b-lg p-4 mt-0">
                                            <Text className="text-foreground/60 text-sm">This request has already been {item.status.toLowerCase()}.</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    </CardContent>
                </Card>
            </View>
            {/* Spacer for bottom tab bar */}
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
