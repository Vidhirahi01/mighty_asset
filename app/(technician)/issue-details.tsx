import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSaveRepairProgress, useTechnicianIssues, useUpdateIssueStatus } from '@/hooks/queries/useIssues';
import { useAuthStore } from '@/store/authStore';

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function IssueDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ issueId?: string }>();
    const issueId = typeof params.issueId === 'string' ? params.issueId : '';

    const currentUser = useAuthStore((state) => state.user);
    const { data: issues = [], isLoading } = useTechnicianIssues(currentUser?.id);
    const saveRepair = useSaveRepairProgress();
    const updateStatus = useUpdateIssueStatus();

    const selectedIssue = useMemo(
        () => issues.find((issue) => issue.id === issueId) ?? null,
        [issues, issueId]
    );

    const [repairStatus, setRepairStatus] = useState('IN_REPAIR');
    const [diagnosticNotes, setDiagnosticNotes] = useState('');
    const [repairActions, setRepairActions] = useState('');
    const [partsUsed, setPartsUsed] = useState('');
    const [checklist, setChecklist] = useState({
        diagnosed: false,
        completed: false,
        tested: false,
        cleaned: false,
        documented: false,
    });

    const statusOptions = ['DIAGNOSING', 'IN_REPAIR', 'TESTING', 'WAITING_PARTS', 'RESOLVED', 'UNREPAIRABLE'];

    const buildNotes = () => {
        const lines = [
            `Diagnostic Notes: ${diagnosticNotes.trim() || 'None'}`,
            `Repair Actions: ${repairActions.trim() || 'None'}`,
            `Parts Used: ${partsUsed.trim() || 'None'}`,
            `Checklist: diagnosed=${checklist.diagnosed}, completed=${checklist.completed}, tested=${checklist.tested}, cleaned=${checklist.cleaned}, documented=${checklist.documented}`,
        ];

        return lines.join('\n');
    };

    const handleSave = (statusOverride?: string) => {
        if (!selectedIssue?.assetId) {
            Alert.alert('Missing Asset', 'This issue has no asset attached.');
            return;
        }

        if (!currentUser?.id) {
            Alert.alert('Missing User', 'Unable to determine technician identity.');
            return;
        }

        const status = statusOverride ?? repairStatus;

        saveRepair.mutate(
            {
                assetId: selectedIssue.assetId,
                technicianId: currentUser.id,
                status,
                notes: buildNotes(),
            },
            {
                onSuccess: () => {
                    if (statusOverride === 'RESOLVED' || statusOverride === 'UNREPAIRABLE') {
                        updateStatus.mutate({ issueId: selectedIssue.id, status: 'RESOLVED' });
                    }
                },
            }
        );
    };

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-4">
                <View className="gap-4">
                    <Pressable onPress={() => router.back()} className="self-start">
                        <Text className="text-primary font-semibold">Back</Text>
                    </Pressable>

                    {isLoading ? (
                        <View className="items-center py-10">
                            <ActivityIndicator color="#1b72fc" />
                            <Text className="mt-2 text-sm text-foreground/60">Loading issue...</Text>
                        </View>
                    ) : !selectedIssue ? (
                        <Text className="text-sm text-foreground/60">Issue not found.</Text>
                    ) : (
                        <>
                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Repair Details</CardTitle>
                                    <CardDescription className="text-foreground/60">Issue summary and asset context</CardDescription>
                                </CardHeader>
                                <CardContent className="gap-2">
                                    <Text className="text-sm font-semibold text-foreground">{selectedIssue.metadata.title}</Text>
                                    <Text className="text-xs text-foreground/60">{selectedIssue.assetName} • {toTitle(selectedIssue.assetCategory)}</Text>
                                    <Text className="text-xs text-foreground/60">Priority: {toTitle(selectedIssue.metadata.priority)}</Text>
                                    <Text className="text-xs text-foreground/60">Started: {selectedIssue.metadata.startedAt}</Text>
                                    <Text className="text-xs text-foreground/70">Details: {selectedIssue.metadata.details}</Text>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border border-border rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg">Diagnostic & Repair</CardTitle>
                                    <CardDescription className="text-foreground/60">Update status and record progress</CardDescription>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    <View className="gap-2">
                                        <Text className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Status</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {statusOptions.map((option) => {
                                                const active = repairStatus === option;
                                                return (
                                                    <Pressable
                                                        key={option}
                                                        onPress={() => setRepairStatus(option)}
                                                        className={`rounded-full border px-3 py-1.5 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                                                    >
                                                        <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground/70'}`}>
                                                            {toTitle(option.toLowerCase().replace('_', ' '))}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Diagnostic Notes</Text>
                                        <Input
                                            value={diagnosticNotes}
                                            onChangeText={setDiagnosticNotes}
                                            placeholder="Add diagnostic notes"
                                            multiline
                                            numberOfLines={4}
                                            className="bg-accent-100 border border-border text-foreground rounded-xl px-3 py-2.5"
                                        />
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Repair Actions Taken</Text>
                                        <Input
                                            value={repairActions}
                                            onChangeText={setRepairActions}
                                            placeholder="Describe repair actions"
                                            multiline
                                            numberOfLines={3}
                                            className="bg-accent-100 border border-border text-foreground rounded-xl px-3 py-2.5"
                                        />
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Parts Used (if any)</Text>
                                        <Input
                                            value={partsUsed}
                                            onChangeText={setPartsUsed}
                                            placeholder="List parts used"
                                            className="bg-accent-100 border border-border text-foreground rounded-xl px-3 py-2.5"
                                        />
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Repair Checklist</Text>
                                        {[
                                            { key: 'diagnosed', label: 'Issue diagnosed' },
                                            { key: 'completed', label: 'Repair completed' },
                                            { key: 'tested', label: 'Tested and verified' },
                                            { key: 'cleaned', label: 'Asset cleaned' },
                                            { key: 'documented', label: 'Documentation updated' },
                                        ].map((item) => {
                                            const checked = checklist[item.key as keyof typeof checklist];
                                            return (
                                                <Pressable
                                                    key={item.key}
                                                    onPress={() =>
                                                        setChecklist((prev) => ({
                                                            ...prev,
                                                            [item.key]: !prev[item.key as keyof typeof prev],
                                                        }))
                                                    }
                                                    className="flex-row items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                                                >
                                                    <View className={`h-4 w-4 rounded border ${checked ? 'bg-primary border-primary' : 'border-foreground/30'}`} />
                                                    <Text className="text-xs text-foreground/70">{item.label}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </CardContent>
                            </Card>

                            <View className="flex-col gap-3">
                                <Pressable
                                    onPress={() => handleSave('RESOLVED')}
                                    disabled={saveRepair.isPending}
                                    className="flex-1 items-center rounded-xl border border-emerald-300 bg-emerald-50 py-3 px-4"
                                >
                                    <Text className="font-semibold text-emerald-800">Mark as Fixed</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleSave('UNREPAIRABLE')}
                                    disabled={saveRepair.isPending}
                                    className="flex-1 items-center rounded-xl border border-rose-300 bg-rose-50 py-3 px-4"
                                >
                                    <Text className="font-semibold text-rose-800">Mark as Unrepairable</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleSave()}
                                    disabled={saveRepair.isPending}
                                    className="flex-1 items-center rounded-xl bg-primary py-3 px-4"
                                >
                                    <Text className="font-semibold text-white">{saveRepair.isPending ? 'Saving...' : 'Save Progress'}</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </View>
            <View style={{ height: 160 }} />
        </ScrollView>
    );
}
