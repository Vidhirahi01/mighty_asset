import React from 'react';
import { Modal, View, Pressable, Text } from 'react-native';

interface LogoutModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loggingOut: boolean;
}

export function LogoutModal({ visible, onConfirm, onCancel, loggingOut }: LogoutModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-card rounded-lg p-6 w-80 shadow-lg">
                    <Text className="text-foreground font-bold text-lg mb-2">Confirm Logout</Text>
                    <Text className="text-foreground/70 mb-6">
                        Are you sure you want to logout? You will need to login again.
                    </Text>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={onCancel}
                            className="flex-1 bg-secondary/10 rounded-lg py-3 items-center"
                            disabled={loggingOut}
                        >
                            <Text className="text-secondary font-bold">Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={onConfirm}
                            className="flex-1 bg-primary rounded-lg py-3 items-center"
                            disabled={loggingOut}
                        >
                            <Text className="text-white font-bold">
                                {loggingOut ? 'Logging out...' : 'Logout'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
