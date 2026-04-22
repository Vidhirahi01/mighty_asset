import React from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { BadgeAlert, Bug, CheckCheck, GitPullRequestArrow } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAssetStats } from '@/hooks/queries/useAssets';

type StatItem = {
    label: string;
    count: number;
};

type CategoryItem = {
    label: string;
    count: number;
};

const POPULAR_CATEGORIES: CategoryItem[] = [
    { label: 'Laptops', count: 76 },
    { label: 'Monitors', count: 42 },
    { label: 'Accessories', count: 33 },
    { label: 'Networking', count: 18 },
];

function MyCard({ item }: { item: StatItem }) {
    const getIcon = (label: string) => {
        const iconProps = { size: 24, color: '#ffffff', strokeWidth: 2 };
        switch (label) {
            case 'Pending Requests': return <GitPullRequestArrow {...iconProps} />;
            case 'Currently Assigned': return <CheckCheck {...iconProps} />;
            case 'Open Issues': return <Bug {...iconProps} />;
            case 'Low Stock Item': return <BadgeAlert {...iconProps} />;
            default: return null;
        }
    };

    return (
        <Card className="mx-2 my-2 flex-1 bg-primary border border-primary shadow-lg">
            <CardContent className="px-5 py-6 items-center justify-center">
                <View className="mb-2 p-2 rounded-full bg-white/20">
                    {getIcon(item.label)}
                </View>
                <Text className="text-white text-xs text-center opacity-90">{item.label}</Text>
                <Text className="mt-3 text-white text-4xl font-bold text-center">{item.count}</Text>
            </CardContent>
        </Card>
    );
}

function CategoryCard({ item }: { item: CategoryItem }) {
    return (
        <Card className="mx-2 my-2 flex-1 bg-primary border border-primary shadow-lg">
            <CardContent className="px-5 py-6 items-center justify-center">
                <Text className="text-white text-xs text-center opacity-90">{item.label}</Text>
                <Text className="mt-3 text-white text-4xl font-bold text-center">{item.count}</Text>
            </CardContent>
        </Card>
    );
}

export default function OperationAssetsScreen() {
    const router = useRouter();
    const { data: stats, isLoading } = useAssetStats();
    const statItems: StatItem[] = [
        { label: 'Total Assets', count: stats?.total ?? 0 },
        { label: 'Available', count: stats?.available ?? 0 },
        { label: 'Assigned', count: stats?.assigned ?? 0 },
        { label: 'In Repair', count: stats?.inRepair ?? 0 },
    ];

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                <View className="mb-4">
                    <Text className="text-2xl font-bold text-foreground">Asset Management</Text>
                    <Text className="text-sm text-muted-foreground">Create and manage operation assets.</Text>
                </View>
                <View className="gap-2">
                    <View className="flex-row gap-2">
                        <FlatList
                            scrollEnabled={false}
                            data={statItems}
                            renderItem={({ item }) => <MyCard item={item} />}
                            keyExtractor={(item) => item.label}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 8 }}
                        />
                    </View>
                </View>
                {isLoading ? (
                    <Text className="mt-2 text-sm text-muted-foreground">Loading asset stats...</Text>
                ) : null}

                <Card className="mb-4 border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Pressable
                            onPress={() => router.push('/asset-category')}
                            className="items-center rounded-xl bg-primary px-4 py-3"
                        >
                            <Text className="font-semibold text-white"> View By Category</Text>
                        </Pressable>
                    </CardContent>
                </Card>

                <View className="mt-2 mb-2">
                    <Text className="text-lg font-bold text-foreground">Popular Categories</Text>
                    <Text className="text-sm text-muted-foreground">Most used categories across your assets.</Text>
                </View>

                <View className="gap-2">
                    <View className="flex-row gap-2">
                        <FlatList
                            scrollEnabled={false}
                            data={POPULAR_CATEGORIES}
                            renderItem={({ item }) => <CategoryCard item={item} />}
                            keyExtractor={(item) => item.label}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 8 }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
