import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, View } from "react-native";

const { width } = Dimensions.get("window");
const drawerWidth = Math.min(390, Math.round(width * 0.9));

type RightDrawerProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const RightDrawer = ({ visible, onClose, children }: RightDrawerProps) => {
    const translateX = useRef(new Animated.Value(width)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateX, {
                toValue: width,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <View
            className="absolute inset-0 z-50"
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            pointerEvents={visible ? "auto" : "none"}
        >
            {visible && (
                <Pressable
                    className="flex-1 bg-black/40"
                    onPress={onClose}
                />
            )}

            <Animated.View
                className="absolute top-0 bottom-0 right-0 bg-card p-5 rounded-l-2xl"
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: drawerWidth,
                    transform: [{ translateX }],
                    shadowColor: "#000",
                    shadowOffset: { width: -2, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 20,
                    overflow: "visible",
                }}
            >
                {children}
            </Animated.View>
        </View>
    );
};
