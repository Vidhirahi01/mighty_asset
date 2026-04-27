import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    type Option,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeAssignedAssets } from '@/hooks/queries/useRequests';
import { createIssue } from '@/services/issue.service';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

type SelectOption = NonNullable<Option>;

type AssignedAsset = {
    id: string | number;
    asset_name: string | null;
    category: string | null;
    brand: string | null;
    model_no: string | null;
    serial_no: string | null;
    status: string | null;
};

type IssueAttachment = {
    name: string;
    url: string;
    type: 'file' | 'photo' | 'video';
};

const ISSUE_TYPES: SelectOption[] = [
    { label: 'Hardware', value: 'hardware' },
    { label: 'Software', value: 'software' },
    { label: 'Network', value: 'network' },
    { label: 'Access Issue', value: 'access-issue' },
    { label: 'Performance Issue', value: 'performance-issue' },
    { label: 'Upgrade Request', value: 'upgrade-request' },
    { label: 'Lost/Damaged', value: 'lost-damaged' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

const ATTACHMENTS_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_ASSETS_BUCKET ?? 'image-asset';

const toArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

const getFileExtension = (uriOrName: string, fallback: string) => {
    const clean = uriOrName.split('?')[0];
    const last = clean.split('.').pop();
    if (!last || last === clean) return fallback;
    return last.toLowerCase();
};

export default function ReportIssueScreen() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const { data: assignedRows = [], isLoading: isLoadingAssets } = useEmployeeAssignedAssets(user?.id, user?.email);
    const [selectedAssetId, setSelectedAssetId] = useState<string | number | null>(null);

    const [issueType, setIssueType] = useState<SelectOption | undefined>(undefined);
    const [priority, setPriority] = useState<SelectOption | undefined>(undefined);
    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startedAt, setStartedAt] = useState('');

    const [attachments, setAttachments] = useState<IssueAttachment[]>([]);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignedAssets = useMemo(
        () => assignedRows
            .filter((item) => Boolean(item.assetId))
            .map((item) => ({
                id: item.assetId as string,
                asset_name: item.assetName,
                category: item.category,
                brand: item.brand,
                model_no: item.modelNo,
                serial_no: null,
                status: 'ASSIGNED',
            })),
        [assignedRows]
    );

    const selectedAsset = useMemo(
        () => assignedAssets.find((asset) => String(asset.id) === String(selectedAssetId)),
        [assignedAssets, selectedAssetId]
    );

    useEffect(() => {
        if (!selectedAssetId && assignedAssets.length > 0) {
            setSelectedAssetId(assignedAssets[0].id);
            return;
        }

        if (selectedAssetId && !assignedAssets.some((asset) => String(asset.id) === String(selectedAssetId))) {
            setSelectedAssetId(assignedAssets[0]?.id ?? null);
        }
    }, [assignedAssets, selectedAssetId]);

    const uploadAttachment = async (uri: string, type: IssueAttachment['type'], explicitName?: string) => {
        const { data: authData, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);

        const userId = authData.user?.id;
        if (!userId) throw new Error('You must be logged in to upload attachments.');

        const ext = getFileExtension(explicitName || uri, type === 'video' ? 'mp4' : 'jpg');
        const fileName = `issue_${type}_${Date.now()}.${ext}`;
        const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const fileData = toArrayBuffer(base64Data);
        const contentType =
            type === 'video'
                ? `video/${ext === 'mov' ? 'quicktime' : ext}`
                : type === 'photo'
                    ? `image/${ext === 'jpg' ? 'jpeg' : ext}`
                    : 'application/octet-stream';

        const storagePath = `${userId}/issues/${fileName}`;

        const { data, error } = await supabase.storage
            .from(ATTACHMENTS_BUCKET)
            .upload(storagePath, fileData, {
                contentType,
                upsert: false,
            });

        if (error) {
            throw new Error(error.message || 'Attachment upload failed.');
        }

        const { data: publicData } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(data.path);
        return { name: explicitName || fileName, url: publicData.publicUrl, type };
    };

    const handlePickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow media library access to upload a photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.9,
        });

        if (result.canceled || !result.assets?.[0]?.uri) return;

        setIsUploadingAttachment(true);
        try {
            const uploaded = await uploadAttachment(result.assets[0].uri, 'photo');
            setAttachments((prev) => [...prev, uploaded]);
        } catch (error) {
            Alert.alert('Upload Error', String(error));
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const handlePickVideo = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow media library access to upload a video.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: false,
            quality: 1,
        });

        if (result.canceled || !result.assets?.[0]?.uri) return;

        setIsUploadingAttachment(true);
        try {
            const picked = result.assets[0];
            const uploaded = await uploadAttachment(picked.uri, 'video', picked.fileName ?? undefined);
            setAttachments((prev) => [...prev, uploaded]);
        } catch (error) {
            Alert.alert('Upload Error', String(error));
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: false,
            copyToCacheDirectory: true,
            type: '*/*',
        });

        if (result.canceled || !result.assets?.[0]?.uri) return;

        setIsUploadingAttachment(true);
        try {
            const picked = result.assets[0];
            const uploaded = await uploadAttachment(picked.uri, 'file', picked.name);
            setAttachments((prev) => [...prev, uploaded]);
        } catch (error) {
            Alert.alert('Upload Error', String(error));
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const resetForm = () => {
        setIssueType(undefined);
        setPriority(undefined);
        setIssueTitle('');
        setDescription('');
        setStartedAt('');
        setAttachments([]);
    };

    const handleSubmit = async () => {
        if (!selectedAsset) {
            Alert.alert('Select Asset', 'Please select an assigned asset first.');
            return;
        }

        if (!issueType?.value || !priority?.value || !issueTitle.trim() || !description.trim() || !startedAt.trim()) {
            Alert.alert('Missing Fields', 'Please fill issue type, priority, title, description and start date.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const requesterId = authData.user?.id ?? null;
            if (!requesterId) {
                Alert.alert('Error', 'You must be logged in to submit an issue.');
                return;
            }

            await createIssue({
                assetId: String(selectedAsset.id),
                reportedBy: requesterId,
                type: String(issueType.value),
                title: issueTitle,
                priority: String(priority.value),
                startedAt,
                description,
                attachments: attachments.map((item) => item.url),
            });

            const keyIdentity = user?.id || user?.email || 'anonymous';
            queryClient.invalidateQueries({ queryKey: queryKeys.requests.employeeOpenIssues(keyIdentity) });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.employee(requesterId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.issues.operations });

            Alert.alert('Issue Submitted', 'Your issue has been submitted successfully.');
            resetForm();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit issue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FlatList
            data={[]}
            keyExtractor={(_, index) => String(index)}
            renderItem={null}
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListHeaderComponent={
                <View className="p-6">
                    <View className="mb-4">
                        <Text className="text-foreground text-2xl font-bold">Report Issue</Text>
                        <Text className="text-foreground/60 text-sm mt-1">Choose your assigned asset and raise an issue.</Text>
                    </View>

                    <Card className="bg-card mb-4">
                        <CardHeader>
                            <CardTitle className="text-foreground">Assigned Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingAssets ? (
                                <Text className="text-foreground/70">Loading assigned assets...</Text>
                            ) : (
                                <View className="gap-2">
                                    {assignedAssets.map((asset) => {
                                        const isSelected = String(selectedAssetId) === String(asset.id);
                                        return (
                                            <Pressable
                                                key={String(asset.id)}
                                                onPress={() => setSelectedAssetId(asset.id)}
                                                className={`rounded-xl px-3 py-3 ${isSelected ? 'bg-primary/10' : 'bg-background'}`}
                                            >
                                                <Text className="font-semibold text-foreground">{asset.asset_name || 'Unnamed Asset'}</Text>
                                                <Text className="text-xs text-foreground/70 mt-1">
                                                    {asset.category || 'Uncategorized'}
                                                    {asset.model_no ? ` | ${asset.model_no}` : ''}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                            {!isLoadingAssets && assignedAssets.length === 0 ? (
                                <Text className="text-xs text-foreground/60 mt-2">
                                    No assigned assets found. Assets appear here only after operations completes assignment.
                                </Text>
                            ) : null}
                        </CardContent>
                    </Card>

                    {selectedAsset ? (
                        <Card className="bg-card mb-4">
                            <CardHeader>
                                <CardTitle className="text-foreground">Issue Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <View className="gap-4">
                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Issue Type</Text>
                                        <Select value={issueType} onValueChange={setIssueType}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select issue type" />
                                            </SelectTrigger>
                                            <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                                <SelectGroup>
                                                    <SelectLabel>Issue Types</SelectLabel>
                                                    {ISSUE_TYPES.map((item) => (
                                                        <SelectItem key={item.value} label={item.label} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Priority</Text>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent insets={{ top: 0, bottom: 0, left: 0, right: 0 }} className="w-full">
                                                <SelectGroup>
                                                    <SelectLabel>Priority</SelectLabel>
                                                    {PRIORITY_OPTIONS.map((item) => (
                                                        <SelectItem key={item.value} label={item.label} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Issue Title</Text>
                                        <TextInput
                                            value={issueTitle}
                                            onChangeText={setIssueTitle}
                                            placeholder="Short summary of the issue"
                                            className="rounded-xl bg-accent p-3 text-foreground"
                                        />
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">Description</Text>
                                        <TextInput
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Describe the issue in detail"
                                            multiline
                                            style={{ textAlignVertical: 'top' }}
                                            className="h-28 rounded-xl bg-accent p-3 text-foreground"
                                        />
                                    </View>

                                    <View>
                                        <Text className="mb-1 font-semibold text-foreground">When did it start?</Text>
                                        <TextInput
                                            value={startedAt}
                                            onChangeText={setStartedAt}
                                            placeholder="YYYY-MM-DD or relative time"
                                            className="rounded-xl bg-accent p-3 text-foreground"
                                        />
                                    </View>

                                    <View>
                                        <Text className="mb-2 font-semibold text-foreground">Attachments</Text>
                                        <View className="flex-row gap-2">
                                            <Pressable
                                                onPress={handlePickFile}
                                                className="flex-1 items-center rounded-xl bg-accent py-3"
                                                disabled={isUploadingAttachment}
                                            >
                                                <Text className="font-semibold text-foreground">Upload File</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={handlePickPhoto}
                                                className="flex-1 items-center rounded-xl bg-accent py-3"
                                                disabled={isUploadingAttachment}
                                            >
                                                <Text className="font-semibold text-foreground">Upload Photo</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={handlePickVideo}
                                                className="flex-1 items-center rounded-xl bg-accent py-3"
                                                disabled={isUploadingAttachment}
                                            >
                                                <Text className="font-semibold text-foreground">Upload Video</Text>
                                            </Pressable>
                                        </View>
                                        <Text className="text-xs text-foreground/60 mt-2">
                                            {isUploadingAttachment ? 'Uploading attachment...' : `${attachments.length} attachment(s) added`}
                                        </Text>
                                        {attachments.length > 0 ? (
                                            <View className="mt-2 gap-1">
                                                {attachments.map((item, index) => (
                                                    <Text key={`${item.url}-${index}`} className="text-xs text-foreground/70">
                                                        {index + 1}. {item.name}
                                                    </Text>
                                                ))}
                                            </View>
                                        ) : null}
                                    </View>

                                    <Card className="bg-accent/40">
                                        <CardContent className="pt-4">
                                            <Text className="font-semibold text-foreground mb-1">What happens next?</Text>
                                            <Text className="text-sm text-foreground/80">
                                                Your issue will be reviewed by the Operations team and assigned to a technician. You'll receive updates on progress.
                                            </Text>
                                        </CardContent>
                                    </Card>

                                    <View className="flex-row gap-3 mt-2">
                                        <Pressable
                                            onPress={resetForm}
                                            className="flex-1 items-center rounded-xl bg-accent py-3"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-foreground">Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit}
                                            className="flex-1 items-center rounded-xl bg-primary py-3"
                                            disabled={isSubmitting}
                                        >
                                            <Text className="font-semibold text-white">{isSubmitting ? 'Submitting...' : 'Submit Issue'}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </CardContent>
                        </Card>
                    ) : null}

                    <View style={{ height: 140 }} />
                </View>
            }
        />
    );
}
