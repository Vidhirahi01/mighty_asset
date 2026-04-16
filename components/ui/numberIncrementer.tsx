import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
interface ScrollNumberPickerProps {
    value: number;
    onChange: (val: number) => void;

    min?: number;
    max?: number;
    step?: number;

    label?: string;
}

export default function ScrollNumberPicker({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
}: ScrollNumberPickerProps) {

    const ITEM_HEIGHT = 32;
    const VISIBLE_ITEMS = 2;
    const PICKER_MAX_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
    const CENTER_PADDING = (PICKER_MAX_HEIGHT - ITEM_HEIGHT) / 2;
    const listRef = useRef<FlatList<number>>(null);

    const data = useMemo(() => {
        const values: number[] = [];
        for (let i = min; i <= max; i += step) {
            values.push(i);
        }
        return values;
    }, [min, max, step]);

    useEffect(() => {
        const currentIndex = Math.max(0, data.indexOf(value));
        listRef.current?.scrollToOffset({
            offset: currentIndex * ITEM_HEIGHT,
            animated: false,
        });
    }, [value, min, max, step]);

    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        const selectedValue = data[Math.max(0, Math.min(index, data.length - 1))];
        if (selectedValue !== value) onChange(selectedValue);
    }, [ITEM_HEIGHT, data, value, onChange]);

    const renderItem = useCallback(({ item }: { item: number }) => {
        const isSelected = item === value;

        return (
            <View
                style={{ height: ITEM_HEIGHT }}
                className="items-center justify-center"
            >
                <Text
                    className={`text-lg ${isSelected ? 'text-blue-500 font-bold' : 'text-gray-400'
                        }`}
                >
                    {item}
                </Text>
            </View>
        );
    }, [ITEM_HEIGHT, value]);

    return (
        <View className=" items-center">

            {label && (
                <Text className=" mb-2 text-sm text-gray-600">{label}</Text>
            )}

            <View
                className="w-full h-24 overflow-hidden rounded-2xl border border-gray-300"
                style={{ height: PICKER_MAX_HEIGHT, maxHeight: PICKER_MAX_HEIGHT }}
            >
                <FlatList
                    ref={listRef}
                    data={data}
                    keyExtractor={(item) => item.toString()}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews
                    nestedScrollEnabled
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: CENTER_PADDING }}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
                    renderItem={renderItem}
                />
            </View>

        </View>
    );
}