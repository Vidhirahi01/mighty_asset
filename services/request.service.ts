// services/request.service.ts
import { supabase } from "@/lib/supabase";

export type CreateAssetRequestInput = {
    email: string;
    userId: string;
    categories: string[];
    quantities: Record<string, number>;
    priorityLabel: string;
    expectedDurationLabel: string;
    reason: string;
    additionalNotes?: string;
};

export type SubmitAssetRequestResult = {
    submittedCount: number;
    skippedCategories: string[];
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

// This is the big one — all the logic that was inside handleSubmit in the component
export async function submitAssetRequest(input: CreateAssetRequestInput): Promise<SubmitAssetRequestResult> {
    // 1. Find already-pending categories
    const pendingCategories = await getPendingRequestCategories(input.userId, input.categories);
    const alreadyPendingSet = new Set(pendingCategories);
    const categoriesToInsert = input.categories.filter((cat) => !alreadyPendingSet.has(cat));

    if (categoriesToInsert.length === 0) {
        throw new Error('ALREADY_PENDING_ALL');
    }

    // 2. Build rows
    const rows = categoriesToInsert.map((category) => ({
        email: input.email,
        asset_id: null,
        type: 'ASSET_REQUEST',
        status: 'PENDING',
        reason: [
            `Title: ${input.reason.trim()}`,
            `Priority: ${input.priorityLabel}`,
            `Expected Duration: ${input.expectedDurationLabel}`,
            `Additional Notes: ${input.additionalNotes?.trim() || 'None'}`,
        ].join('\n'),
        approved_by: null,
        user_id: input.userId,
        category,
        brand: null,
        model_no: null,
        quantity: input.quantities[category] ?? 1,
    }));

    // 3. Insert into Supabase
    const { error } = await supabase.from('request_table').insert(rows);
    if (error) throw new Error(error.message);

    return {
        submittedCount: rows.length,
        skippedCategories: pendingCategories,
    };
}