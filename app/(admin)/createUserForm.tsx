import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {

    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import React from 'react';
import { Alert, Pressable, type TextInput, View, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { createUser, generateTemporaryPassword } from '@/services/user.service';
import { storeTempPassword } from '@/lib/localStorage';
import { ChevronDown, X, Copy, RefreshCw } from 'lucide-react-native';
import BottomSheet, { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface CreateUserFormProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateUserForm({ isVisible, onClose, onSuccess }: CreateUserFormProps) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = ['50%', '90%'];

    const nameInputRef = React.useRef<TextInput>(null);
    const emailInputRef = React.useRef<TextInput>(null);
    const roleInputRef = React.useRef<TextInput>(null);
    const departmentInputRef = React.useRef<TextInput>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(generateTemporaryPassword());
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    const roleOptions = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN', 'OPERATION'];
    const departmentOptions = ['IT', 'HR', 'Operations', 'Finance', 'Support', 'Electrical'];

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                // appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );

    // Update modal visibility
    React.useEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isVisible]);

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name is required");
            return false;
        }
        if (!email.trim()) {
            Alert.alert("Error", "Email is required");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email");
            return false;
        }
        if (!role) {
            Alert.alert("Error", "Role is required");
            return false;
        }
        if (!department) {
            Alert.alert("Error", "Department is required");
            return false;
        }
        return true;
    };

    const onSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log("Calling createUser with:", { name, email, role, department });
            const result = await createUser({
                name: name.trim(),
                email: email.trim(),
                password,
                role,
                department,
                is_active: isActive,
            });
            console.log("Result:", result);
            await storeTempPassword(email.trim(), password);

            Alert.alert(
                "User Created Successfully!",
                `Email: ${email.trim()}\n\nTemporary Password:\n${result.temporaryPassword}\n\nShare this password with the user. They will be required to change it on first login.`,
                [{
                    text: "OK", onPress: () => {
                        resetForm();
                        onSuccess?.();
                        onClose();
                    }
                }]
            );
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword(generateTemporaryPassword());
        setShowPassword(false);
        setRole("");
        setDepartment("");
        setIsActive(true);
        setShowRoleDropdown(false);
        setShowDepartmentDropdown(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            onDismiss={handleClose}
            backgroundStyle={{ backgroundColor: '#f8f9fa' }}
            handleIndicatorStyle={{ backgroundColor: '#1b72fc' }}
            backdropComponent={renderBackdrop}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
        >
            <BottomSheetScrollView
                className="flex-1 bg-background px-4 pt-4"
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
            >
                <View className="flex-row items-center justify-between mb-6">
                    <CardTitle className="text-foreground font-bold text-2xl">Create New User</CardTitle>
                    <Pressable onPress={handleClose} className="p-2">
                        <X size={24} color="#1a1a1a" />
                    </Pressable>
                </View>

                <View className="gap-5 pb-32">
                    {/* Name Field */}
                    <View className="gap-2">
                        <Label htmlFor="name" className="text-foreground font-semibold">Full Name</Label>
                        <Input
                            ref={nameInputRef}
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            onSubmitEditing={() => emailInputRef.current?.focus()}
                            returnKeyType="next"
                            className="bg-accent-100 border border-border text-foreground placeholder:text-foreground/40 rounded-lg px-4 py-3"
                        />
                    </View>

                    {/* Email Field */}
                    <View className="gap-2">
                        <Label htmlFor="email" className="text-foreground font-semibold">Email Address</Label>
                        <Input
                            ref={emailInputRef}
                            id="email"
                            placeholder="john@example.com"
                            keyboardType="email-address"
                            autoComplete="email"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onSubmitEditing={() => roleInputRef.current?.focus()}
                            returnKeyType="next"
                            className="bg-accent-100 border border-border text-foreground placeholder:text-foreground/40 rounded-lg px-4 py-3"
                        />
                    </View>

                    {/* Temporary Password Field */}
                    <View className="gap-2">
                        <Label className="text-foreground font-semibold">Temporary Password</Label>
                        <View className="flex-row gap-2">
                            <View className="flex-1 bg-accent-100 border border-border rounded-lg px-4 py-3 justify-center">
                                <Text className="text-foreground font-mono tracking-wider">
                                    {showPassword ? password : password.replace(/./g, '•')}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                className="bg-accent-100 border border-border rounded-lg px-3 justify-center"
                            >
                                <Text className="text-primary font-bold text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={() => setPassword(generateTemporaryPassword())}
                            className="flex-row items-center gap-2 bg-accent-100 border border-border rounded-lg px-4 py-2"
                        >
                            <RefreshCw size={16} color="#1b72fc" />
                            <Text className="text-primary font-semibold">Generate New Password</Text>
                        </Pressable>
                        <Text className="text-foreground/60 text-xs">User will be required to change password on first login</Text>
                    </View>

                    {/* Role Field */}
                    <View className="gap-2">
                        <Label htmlFor="role" className="text-foreground font-semibold">Role</Label>
                        <Pressable
                            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="bg-accent-100 border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <Text className={role ? "text-foreground" : "text-foreground/40"}>
                                {role || "Select a role"}
                            </Text>
                            <ChevronDown size={20} color="#1b72fc" />
                        </Pressable>
                        {showRoleDropdown && (
                            <View className="bg-card border border-border rounded-lg mt-2 overflow-hidden max-h-48">
                                <FlatList
                                    data={roleOptions}
                                    keyExtractor={(item) => item}
                                    scrollEnabled={true}
                                    renderItem={({ item: option }) => (
                                        <Pressable
                                            onPress={() => {
                                                setRole(option);
                                                setShowRoleDropdown(false);
                                            }}
                                            className="px-4 py-3 border-b border-border"
                                        >
                                            <Text className={`font-medium ${role === option ? "text-primary" : "text-foreground"}`}>
                                                {option}
                                            </Text>
                                        </Pressable>
                                    )}
                                />
                            </View>
                        )}
                    </View>

                    {/* Department Field */}
                    <View className="gap-2">
                        <Label htmlFor="department" className="text-foreground font-semibold">Department</Label>
                        <Pressable
                            onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                            className="bg-accent-100 border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <Text className={department ? "text-foreground" : "text-foreground/40"}>
                                {department || "Select a department"}
                            </Text>
                            <ChevronDown size={20} color="#1b72fc" />
                        </Pressable>
                        {showDepartmentDropdown && (
                            <View className="bg-card border border-border rounded-lg mt-2 overflow-hidden max-h-48">
                                <FlatList
                                    data={departmentOptions}
                                    keyExtractor={(item) => item}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                    renderItem={({ item: option }) => (
                                        <Pressable
                                            onPress={() => {
                                                setDepartment(option);
                                                setShowDepartmentDropdown(false);
                                            }}
                                            className="px-4 py-3 border-b border-border"
                                        >
                                            <Text className={`font-medium ${department === option ? "text-primary" : "text-foreground"}`}>
                                                {option}
                                            </Text>
                                        </Pressable>
                                    )}
                                />
                            </View>
                        )}
                    </View>

                    {/* Active Status */}
                    <View className="gap-2">
                        <Label className="text-foreground font-semibold">Status</Label>
                        <Pressable
                            onPress={() => setIsActive(!isActive)}
                            className="bg-accent-100 border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <Text className="text-foreground font-medium">
                                {isActive ? "Active" : "Inactive"}
                            </Text>
                            <View className={`w-12 h-6 rounded-full flex-row items-center ${isActive ? "bg-primary" : "bg-gray-300"}`}>
                                <View className={`w-5 h-5 rounded-full bg-white ${isActive ? "ml-auto mr-0.5" : "ml-0.5"}`} />
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Buttons */}
                <View className="gap-3 mb-6 mt-6">
                    <Button
                        className="w-full bg-primary rounded-lg py-3"
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-white font-bold text-base">Create User</Text>
                        )}
                    </Button>

                    <Button
                        className="w-full bg-accent-100 border border-border rounded-lg "
                        onPress={handleClose}
                    >
                        <Text className="text-foreground font-bold text-base">Cancel</Text>
                    </Button>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
