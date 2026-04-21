import { supabase } from "@/lib/supabase";

export type CreateAssetRequestInput = {
    email: string;
    userId: string;
    managerId: string;
    categories: string[];
    quantities: Record<string, number>;
    priority: string;
    expectedDuration: string;
    reason: string;
    additionalNotes?: string;
};

export async function getUserByEmail(email: string) {
    const { data, error } = await supabase
        .from('user_table')
        .select('id, email, role, is_active')
        .eq('email', email)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getActiveManager() {
    const { data, error } = await supabase
        .from('user_table')
        .select('id')
        .eq('role', 'MANAGER')
        .eq('is_active', true)
        .limit(1);

    if (error) throw new Error(error.message);
    if (!data?.[0]?.id) throw new Error('No active manager found');
    return data[0];
}

export async function getPendingRequestCategories(userId: string, categories: string[]) {
    const { data, error } = await supabase
        .from('request_table')
        .select('category')
        .eq('user_id', userId)
        .eq('type', 'ASSET_REQUEST')
        .eq('status', 'PENDING')
        .in('category', categories);

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.category).filter(Boolean) as string[];
}

export async function createAssetRequests(input: CreateAssetRequestInput) {
    const rows = input.categories.map((category) => ({
        email: input.email,
        asset_id: null,
        type: 'ASSET_REQUEST',
        status: 'PENDING',
        reason: [
            'Title: ' + input.reason.trim(),
            'Priority: ' + input.priority,
            'Expected Duration: ' + input.expectedDuration,
            'Additional Notes: ' + (input.additionalNotes?.trim() || 'None'),
        ].join('\n'),
        approved_by: input.managerId,
        user_id: input.userId,
        category,
        brand: null,
        model_no: null,
        quantity: input.quantities[category] ?? 1,
    }));

    const { error } = await supabase.from('request_table').insert(rows);
    if (error) throw new Error(error.message);
    return rows.length;
}