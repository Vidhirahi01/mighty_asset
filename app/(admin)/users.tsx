import { Input } from '@/components/ui/input';
import { Plus, ChevronDown, Save, X, Search } from 'lucide-react-native';
import { Text, View, ScrollView, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import CreateUserForm from './createUserForm';
import { fetchAllUsers, updateUser } from '@/services/user.service';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    is_active: boolean;
    created_at: string;
}

export default function UsersScreen() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editDepartment, setEditDepartment] = useState('');
    const [editIsActive, setEditIsActive] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    const departments = ['All', 'IT', 'HR', 'Operations', 'Finance', 'Support', 'Engineering'];
    const roleOptions = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN', 'OPERATION'];

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchAllUsers() as User[];
            setUsers(data);
        } catch {
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditDepartment(user.department);
        setEditIsActive(user.is_active);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        if (!editName.trim() || !editEmail.trim() || !editRole || !editDepartment) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        try {
            setUpdating(true);
            await updateUser(selectedUser.id, {
                name: editName.trim(),
                email: editEmail.trim(),
                role: editRole,
                department: editDepartment,
                is_active: editIsActive,
            });
            Alert.alert('Success', 'User updated successfully');
            setSelectedUser(null);
            loadUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update user');
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesDept = selectedDepartment === 'All' || user.department === selectedDepartment;
        const matchesSearch =
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const roleColors: Record<string, string> = {
        ADMIN: 'text-rose-500 bg-rose-50',
        MANAGER: 'text-violet-500 bg-violet-50',
        EMPLOYEE: 'text-blue-500 bg-blue-50',
        TECHNICIAN: 'text-amber-500 bg-amber-50',
        OPERATION: 'text-teal-500 bg-teal-50',
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <Pressable
            onPress={() => handleSelectUser(item)}
            className={`bg-card border rounded-xl p-4 mb-2 flex-row items-center gap-3 ${selectedUser?.id === item.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
        >
            {/* Avatar */}
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
                <Text className="text-primary font-bold text-base">
                    {item.name?.charAt(0).toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
                <Text className="text-foreground font-semibold" numberOfLines={1}>{item.name}</Text>
                <Text className="text-foreground/50 text-xs mt-0.5" numberOfLines={1}>{item.email}</Text>
                <View className="flex-row gap-1.5 mt-1.5">
                    <Text className={`text-xs font-semibold px-2 py-0.5 rounded-md ${roleColors[item.role] || 'text-primary bg-primary/10'}`}>
                        {item.role}
                    </Text>
                    <Text className="text-xs font-semibold text-foreground/50 bg-accent-100 px-2 py-0.5 rounded-md">
                        {item.department}
                    </Text>
                </View>
            </View>

            {/* Status dot */}
            <View className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
        </Pressable>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Top bar */}
            <View className="px-5 pt-4 pb-3 gap-3">
                {/* Search + Add row */}
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
                    {departments.map((dept) => (
                        <Pressable
                            key={dept}
                            onPress={() => setSelectedDepartment(dept)}
                            className={`px-3 py-1.5 rounded-lg border ${selectedDepartment === dept
                                ? 'bg-primary border-primary'
                                : 'bg-accent-100 border-border'
                                }`}
                        >
                            <Text className={`text-xs font-semibold ${selectedDepartment === dept ? 'text-white' : 'text-foreground/70'
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

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 ">
                {loading ? (
                    <ActivityIndicator size="large" color="#1b72fc" className="mt-10" />
                ) : filteredUsers.length === 0 ? (
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
                                    {roleOptions.map((role) => (
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
                                    {departments.slice(1).map((dept) => (
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

                        {/* Status */}
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

                        {/* Save */}
                        <Pressable
                            onPress={handleSaveUser}
                            disabled={updating}
                            className="w-full bg-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
                        >
                            {updating ? (
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

            <CreateUserForm
                isVisible={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSuccess={loadUsers}
            />
        </View>
    );
}