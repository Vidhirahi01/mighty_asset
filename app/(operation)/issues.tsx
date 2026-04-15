import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export default function IssuesScreen() {
    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
                <View className="mb-4">
                    <Text className="text-2xl font-bold text-foreground">Issues</Text>
                    <Text className="text-sm text-muted-foreground">Track pending and active asset-related issues.</Text>
                </View>

                <Card className="border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">Issue Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Text className="text-sm text-muted-foreground">No issues added yet.</Text>
                    </CardContent>
                </Card>
            </ScrollView>
        </View>
    );
}
