// app/(admin)/users.tsx
import { Input } from '@/components/ui/input';
import { Plus, ChevronDown, Save, X, Search } from 'lucide-react-native';
import { Text, View, ScrollView, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
// FIX: removed useEffect — not needed anymore
// FIX: removed fetchAllUsers, updateUser direct imports — now handled by hooks
import CreateUserForm from './createUserForm';
import { useUsers, useUpdateUser, User } from '@/hooks/queries/useUsers';

const DEPARTMENTS = ['All', 'IT', 'HR', 'Operations', 'Finance', 'Support', 'Engineering'];
const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN', 'OPERATION'];
const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'text-rose-500 bg-rose-50',
    MANAGER: 'text-violet-500 bg-violet-50',
    EMPLOYEE: 'text-blue-500 bg-blue-50',
    TECHNICIAN: 'text-amber-500 bg-amber-50',
    OPERATION: 'text-teal-500 bg-teal-50',
};

export default function UsersScreen() {

    // ── TanStack Query hooks ──────────────────────────────────────
    const { data: users = [], isLoading, error } = useUsers();
    const updateUserMutation = useUpdateUser();

    // ── UI state only (no data fetching state needed anymore) ─────
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [searchText, setSearchText] = useState('');

    // Edit form fields
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editDepartment, setEditDepartment] = useState('');
    const [editIsActive, setEditIsActive] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────
    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditDepartment(user.department);
        setEditIsActive(user.is_active);
    };

    const handleSaveUser = () => {
        if (!selectedUser) return;
        if (!editName.trim() || !editEmail.trim() || !editRole || !editDepartment) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        updateUserMutation.mutate(
            {
                userId: selectedUser.id,
                data: {
                    name: editName.trim(),
                    email: editEmail.trim(),
                    role: editRole,
                    department: editDepartment,
                    is_active: editIsActive,
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'User updated!');
                    setSelectedUser(null);
                    // No need to call loadUsers() — invalidateQueries auto-refreshes the list
                },
                onError: (err: any) => {
                    Alert.alert('Error', err.message || 'Failed to update user');
                },
            }
        );
    };

    // ── Derived data ──────────────────────────────────────────────
    const filteredUsers = users.filter(user => {
        const matchesDept = selectedDepartment === 'All' || user.department === selectedDepartment;
        const matchesSearch =
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        return matchesDept && matchesSearch;
    });

    // isLoading from useQuery replaces the old manual 'loading' state
    // isPending from useMutation replaces the old manual 'updating' state
    const isUpdating = updateUserMutation.isPending;

    // ── Early returns for loading/error ───────────────────────────
    if (isLoading) return <ActivityIndicator size="large" color="#1b72fc" style={{ marginTop: 40 }} />;
    if (error) return <Text style={{ margin: 20, color: 'red' }}>Failed to load users. Please restart.</Text>;

    // ── Render ────────────────────────────────────────────────────
    const renderUserItem = ({ item }: { item: User }) => (
        <Pressable
            onPress={() => handleSelectUser(item)}
            className={`bg-card border rounded-xl p-4 mb-2 flex-row items-center gap-3 ${
                selectedUser?.id === item.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
        >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
                <Text className="text-primary font-bold text-base">
                    {item.name?.charAt(0).toUpperCase()}
                </Text>
            </View>

            <View className="flex-1 min-w-0">
                <Text className="text-foreground font-semibold" numberOfLines={1}>{item.name}</Text>
                <Text className="text-foreground/50 text-xs mt-0.5" numberOfLines={1}>{item.email}</Text>
                <View className="flex-row gap-1.5 mt-1.5">
                    <Text className={`text-xs font-semibold px-2 py-0.5 rounded-md ${ROLE_COLORS[item.role] || 'text-primary bg-primary/10'}`}>
                        {item.role}
                    </Text>
                    <Text className="text-xs font-semibold text-foreground/50 bg-accent-100 px-2 py-0.5 rounded-md">
                        {item.department}
                    </Text>
                </View>
            </View>

            <View className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
        </Pressable>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Top bar */}
            <View className="px-5 pt-4 pb-3 gap-3">
                <View className="flex-row gap-2 items-center">
                    <View className="flex-1 flex-row items-center bg-accent-100 border border-border rounded-xl px-3 gap-2">
                        <Search size={16} color="#9ca3af" />
                        <Input
                            placeholder="Search users..."
                            value={searchText}
                            onChangeText={setSearchText}
                            className="flex-1 border-0 bg-transparent text-foreground py-2.5"
                        />
                    </View>
                    <Pressable
                        onPress={() => setShowCreateForm(true)}
                        className="bg-primary rounded-xl w-11 h-11 items-center justify-center"
                    >
                        <Plus size={20} color="#ffffff" />
                    </Pressable>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                    contentContainerStyle={{ alignItems: 'center', gap: 6 }}
                >
                    {DEPARTMENTS.map((dept) => (
                        <Pressable
                            key={dept}
                            onPress={() => setSelectedDepartment(dept)}
                            className={`px-3 py-1.5 rounded-lg border ${
                                selectedDepartment === dept
                                    ? 'bg-primary border-primary'
                                    : 'bg-accent-100 border-border'
                            }`}
                        >
                            <Text className={`text-xs font-semibold ${
                                selectedDepartment === dept ? 'text-white' : 'text-foreground/70'
                            }`}>
                                {dept}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View className="px-5 pb-2">
                <Text className="text-foreground/40 text-xs">
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
                {filteredUsers.length === 0 ? (
                    <View className="items-center mt-16 gap-2">
                        <Text className="text-foreground/30 text-4xl">👤</Text>
                        <Text className="text-foreground/40 text-sm">No users found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                )}

                {selectedUser && (
                    <View className="bg-card border border-border rounded-2xl p-5 mt-4 mb-8">
                        <View className="flex-row items-center justify-between mb-5">
                            <View>
                                <Text className="text-foreground font-bold text-base">Edit User</Text>
                                <Text className="text-foreground/40 text-xs mt-0.5">{selectedUser.email}</Text>
                            </View>
                            <Pressable
                                onPress={() => setSelectedUser(null)}
                                className="w-8 h-8 rounded-full bg-accent-100 items-center justify-center"
                            >
                                <X size={16} color="#6b7280" />
                            </Pressable>
                        </View>

                        <View className="mb-4">
                            <Text className="text-foreground/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">Name</Text>
                            <Input
                                value={editName}
                                onChangeText={setEditName}
                                className="bg-accent-100 border border-border text-foreground rounded-xl px-3 py-2.5"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-foreground/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">Email</Text>
                            <Input
                                value={editEmail}
                                onChangeText={setEditEmail}
                                keyboardType="email-address"
                                className="bg-accent-100 border border-border text-foreground rounded-xl px-3 py-2.5"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-foreground/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">Role</Text>
                            <Pressable
                                onPress={() => { setShowRoleDropdown(!showRoleDropdown); setShowDepartmentDropdown(false); }}
                                className="bg-accent-100 border border-border rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                            >
                                <Text className="text-foreground">{editRole}</Text>
                                <ChevronDown size={16} color="#9ca3af" />
                            </Pressable>
                            {showRoleDropdown && (
                                <View className="bg-card border border-border rounded-xl mt-1 overflow-hidden">
                                    {ROLE_OPTIONS.map((role) => (
                                        <Pressable
                                            key={role}
                                            onPress={() => { setEditRole(role); setShowRoleDropdown(false); }}
                                            className="px-3 py-2.5 border-b border-border/50"
                                        >
                                            <Text className={editRole === role ? 'text-primary font-bold' : 'text-foreground'}>
                                                {role}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-foreground/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">Department</Text>
                            <Pressable
                                onPress={() => { setShowDepartmentDropdown(!showDepartmentDropdown); setShowRoleDropdown(false); }}
                                className="bg-accent-100 border border-border rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                            >
                                <Text className="text-foreground">{editDepartment}</Text>
                                <ChevronDown size={16} color="#9ca3af" />
                            </Pressable>
                            {showDepartmentDropdown && (
                                <View className="bg-card border border-border rounded-xl mt-1 overflow-hidden max-h-40">
                                    {DEPARTMENTS.slice(1).map((dept) => (
                                        <Pressable
                                            key={dept}
                                            onPress={() => { setEditDepartment(dept); setShowDepartmentDropdown(false); }}
                                            className="px-3 py-2.5 border-b border-border/50"
                                        >
                                            <Text className={editDepartment === dept ? 'text-primary font-bold' : 'text-foreground'}>
                                                {dept}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View className="mb-5">
                            <Text className="text-foreground/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">Status</Text>
                            <Pressable
                                onPress={() => setEditIsActive(!editIsActive)}
                                className="bg-accent-100 border border-border rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center gap-2">
                                    <View className={`w-2 h-2 rounded-full ${editIsActive ? 'bg-green-500' : 'bg-red-400'}`} />
                                    <Text className="text-foreground font-medium">
                                        {editIsActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                                <View className={`w-10 h-6 rounded-full flex-row items-center px-0.5 ${editIsActive ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <View className={`w-5 h-5 rounded-full bg-white shadow-sm ${editIsActive ? 'ml-auto' : ''}`} />
                                </View>
                            </Pressable>
                        </View>

                        {/* FIX: disabled={isUpdating} uses mutation's isPending, not old 'updating' state */}
                        <Pressable
                            onPress={handleSaveUser}
                            disabled={isUpdating}
                            className="w-full bg-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <>
                                    <Save size={18} color='#ffffff' />
                                    <Text className="text-white font-bold">Save Changes</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <View style={{ height: 160 }} />

            {/*
              FIX: onSuccess was wrongly set to {useUpdateUser} (the hook itself).
              It should be a plain function () => setShowCreateForm(false).
              The list auto-refreshes via invalidateQueries inside useCreateUser —
              you do NOT need to pass loadUsers here anymore.
            */}
            <CreateUserForm
                isVisible={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSuccess={() => setShowCreateForm(false)}
            />
        </View>
    );
}