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

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ManagerRequestRow = {
    id: string;
    created_at: string;
    email: string | null;
    user_id?: string | null;
    requester_name?: string | null;
    category: string | null;
    reason: string | null;
    status: RequestStatus;
    quantity: number | null;
};

export type RequestSummary = {
    pendingApprovals: number;
    openIssues: number;
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

export async function submitAssetRequest(input: CreateAssetRequestInput): Promise<SubmitAssetRequestResult> {
    const appUser = await getUserByEmail(input.email);
    let managerId: string | null = null;
    try {
        const manager = await getActiveManager();
        managerId = manager.id;
    } catch {
        managerId = null;
    }

    const pendingCategories = await getPendingRequestCategories(appUser.id, input.categories);
    const alreadyPendingSet = new Set(pendingCategories);
    const categoriesToInsert = input.categories.filter((cat) => !alreadyPendingSet.has(cat));

    if (categoriesToInsert.length === 0) {
        throw new Error('ALREADY_PENDING_ALL');
    }

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
        approved_by: managerId,
        user_id: appUser.id,
        category,
        brand: null,
        model_no: null,
        quantity: input.quantities[category] ?? 1,
    }));

    const { error } = await supabase.from('request_table').insert(rows);
    if (error) throw new Error(error.message);

    return {
        submittedCount: rows.length,
        skippedCategories: pendingCategories,
    };
}

export async function getManagerRequests(): Promise<ManagerRequestRow[]> {
    const { data, error } = await supabase
        .from('request_table')
        .select('id, created_at, email, user_id, category, reason, status, quantity, type')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<ManagerRequestRow & { type?: string | null }>;
    const filteredRows = rows.filter((row) => {
        const type = String(row.type ?? '').toUpperCase();
        return type === 'ASSET_REQUEST' || type === 'ASSET-REQUEST' || type === 'ASSETREQUEST';
    });

    const userIds = Array.from(
        new Set(
            filteredRows
                .map((row) => row.user_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    if (userIds.length === 0) {
        return filteredRows;
    }

    const { data: users, error: usersError } = await supabase
        .from('user_table')
        .select('id, name')
        .in('id', userIds);

    if (usersError || !users) {
        return filteredRows;
    }

    const nameById = new Map(
        users
            .map((user) => [String((user as { id: string }).id), String((user as { name?: string | null }).name ?? '')])
    );

    return filteredRows.map((row) => ({
        ...row,
        requester_name: row.user_id ? (nameById.get(String(row.user_id)) || null) : null,
    }));
}

export async function updateRequestStatus(requestId: string, status: RequestStatus) {
    const { error } = await supabase
        .from('request_table')
        .update({ status })
        .eq('id', requestId);

    if (error) throw new Error(error.message);
}

export async function getRequestSummary(): Promise<RequestSummary> {
    const { data, error } = await supabase
        .from('request_table')
        .select('type, status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<{ type: string | null; status: string | null }>;

    const pendingApprovals = rows.filter((row) => {
        const type = (row.type ?? '').toUpperCase();
        const status = (row.status ?? '').toUpperCase();
        const isAssetRequest = type === 'ASSET_REQUEST' || type === 'ASSET-REQUEST' || type === 'ASSETREQUEST';
        return isAssetRequest && status === 'PENDING';
    }).length;

    const openIssues = rows.filter((row) => {
        const type = (row.type ?? '').toUpperCase();
        const status = (row.status ?? '').toUpperCase();
        return (type === 'ISSUE_REPORT' || type === 'ISSUE-REPORT') && status === 'PENDING';
    }).length;

    return {
        pendingApprovals,
        openIssues,
    };
}