import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";

const ASSETS_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_ASSETS_BUCKET ?? "image-asset";

type ImagePickerExampleProps = {
    onUploaded?: (url: string | null) => void;
};

export default function ImagePickerExample({ onUploaded }: ImagePickerExampleProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
  
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (result.canceled) return;

        const localUri = result.assets[0]?.uri;
        if (!localUri) return;

        setImage(localUri);
        setIsUploading(true);

        try {
            const publicUrl = await uploadImage(localUri);
            onUploaded?.(publicUrl);
        } catch (error) {
            console.error("Upload failed:", error);
            Alert.alert("Upload failed", String(error));
            onUploaded?.(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View className="w-full mb-6">
            <Text className="mb-2 font-semibold text-foreground">Asset Image</Text>
            <Pressable
                onPress={pickImage}
                className="bg-accent rounded-xl p-4 border border-border flex-row items-center justify-between"
            >
                <View>
                    <Text className="text-foreground font-semibold">Upload image</Text>
                    <Text className="text-muted-foreground text-xs">
                        {isUploading ? "Uploading..." : "PNG or JPG, up to 5MB"}
                    </Text>
                </View>
                <View className="bg-background border border-border rounded-full px-3 py-1">
                    <Text className="text-foreground text-xs font-semibold">Browse</Text>
                </View>
            </Pressable>

            {image && (
                <View className="mt-4 rounded-xl overflow-hidden border border-border bg-card">
                    <Image source={{ uri: image }} className="w-full h-44" resizeMode="cover" />
                </View>
            )}
        </View>
    );
}
const uploadImage = async (imageUri: string) => {
    const fileName = `asset_${Date.now()}.jpg`;

    const base64ToArrayBuffer = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
    };

    try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
            throw new Error(`Auth check failed: ${userError.message}`);
        }

        const userId = userData.user?.id;
        if (!userId) {
            throw new Error("You must be logged in to upload images.");
        }

        const storagePath = `${userId}/${fileName}`;

        const base64Data = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        const fileData = base64ToArrayBuffer(base64Data);

        const { data, error } = await supabase.storage
            .from(ASSETS_BUCKET)
            .upload(storagePath, fileData, {
                contentType: "image/jpeg",
                upsert: false,
            });

        if (error) {
            if (error.message.toLowerCase().includes("bucket not found")) {
                throw new Error(
                    `Storage bucket '${ASSETS_BUCKET}' was not found. Create it in Supabase Storage or set EXPO_PUBLIC_SUPABASE_ASSETS_BUCKET to an existing bucket name.`
                );
            }
            if (error.message.toLowerCase().includes("row-level security policy")) {
                throw new Error(
                    `Upload blocked by Supabase Storage RLS policy for bucket '${ASSETS_BUCKET}'. Add an INSERT policy for authenticated users on storage.objects.`
                );
            }
            throw error;
        }

        const { data: publicData } = supabase.storage
            .from(ASSETS_BUCKET)
            .getPublicUrl(data.path);

        return publicData.publicUrl;
    } catch (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
    }
};
