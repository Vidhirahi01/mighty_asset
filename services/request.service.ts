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

export type EmployeeAssignedAsset = {
    requestId: string;
    assetId: string | null;
    assetName: string;
    category: string;
    quantity: number;
    status: RequestStatus;
    approvedAt: string;
    requestedBy: string | null;
    reason: string | null;
    brand: string | null;
    modelNo: string | null;
    condition: string | null;
    note: string | null;
    imageUrl: string | null;
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

export async function getApprovedAssetsForUser(params: {
    userId?: string | null;
    email?: string | null;
}): Promise<EmployeeAssignedAsset[]> {
    const userId = params.userId?.trim() || null;
    const email = params.email?.trim() || null;

    if (!userId && !email) {
        return [];
    }

    let query = supabase
        .from('request_table')
        .select('id, created_at, email, user_id, category, quantity, reason, status, type, asset_id')
        .eq('status', 'APPROVED');

    if (userId && email) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
    } else if (userId) {
        query = query.eq('user_id', userId);
    } else if (email) {
        query = query.eq('email', email);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    const approvedRows = ((data ?? []) as Array<{
        id: string;
        created_at: string;
        email: string | null;
        user_id: string | null;
        category: string | null;
        quantity: number | null;
        reason: string | null;
        status: RequestStatus;
        type: string | null;
        asset_id: string | null;
    }>).filter((row) => {
        const type = String(row.type ?? '').toUpperCase();
        return type === 'ASSET_REQUEST' || type === 'ASSET-REQUEST' || type === 'ASSETREQUEST';
    });

    if (approvedRows.length === 0) {
        return [];
    }

    const assetIds = Array.from(
        new Set(
            approvedRows
                .map((row) => row.asset_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    let assetMap = new Map<string, {
        asset_name: string | null;
        category: string | null;
        brand: string | null;
        model_no: string | null;
        condition: string | null;
        note: string | null;
        image_url: string | null;
    }>();

    if (assetIds.length > 0) {
        const { data: assets, error: assetError } = await supabase
            .from('asset_table')
            .select('id, asset_name, category, brand, model_no, condition, note, image_url')
            .in('id', assetIds);

        if (assetError) {
            throw new Error(assetError.message);
        }

        assetMap = new Map(
            ((assets ?? []) as Array<{
                id: string;
                asset_name: string | null;
                category: string | null;
                brand: string | null;
                model_no: string | null;
                condition: string | null;
                note: string | null;
                image_url: string | null;
            }>).map((asset) => [asset.id, asset])
        );
    }

    return approvedRows.map((row) => {
        const asset = row.asset_id ? assetMap.get(row.asset_id) : undefined;
        const fallbackCategory = row.category || 'uncategorized';
        const displayCategory = asset?.category || fallbackCategory;
        const assetName = asset?.asset_name || `${displayCategory} asset`;

        return {
            requestId: row.id,
            assetId: row.asset_id,
            assetName,
            category: displayCategory,
            quantity: Number(row.quantity ?? 1),
            status: row.status,
            approvedAt: row.created_at,
            requestedBy: row.email,
            reason: row.reason,
            brand: asset?.brand || null,
            modelNo: asset?.model_no || null,
            condition: asset?.condition || null,
            note: asset?.note || null,
            imageUrl: asset?.image_url || null,
        } satisfies EmployeeAssignedAsset;
    });
}

export async function getEmployeeOpenIssueCount(params: {
    userId?: string | null;
    email?: string | null;
}): Promise<number> {
    const userId = params.userId?.trim() || null;
    const email = params.email?.trim() || null;

    if (!userId && !email) {
        return 0;
    }

    let query = supabase
        .from('request_table')
        .select('type, status, user_id, email');

    if (userId && email) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
    } else if (userId) {
        query = query.eq('user_id', userId);
    } else if (email) {
        query = query.eq('email', email);
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(error.message);
    }

    const rows = (data ?? []) as Array<{ type: string | null; status: string | null }>;

    return rows.filter((row) => {
        const type = String(row.type ?? '').toUpperCase();
        const status = String(row.status ?? '').toUpperCase();
        const isIssueType = type === 'ISSUE_REPORT' || type === 'ISSUE-REPORT' || type === 'ISSUEREPORT';
        const isActive = status === 'PENDING' || status === 'OPEN' || status === 'IN_PROGRESS';
        return isIssueType && isActive;
    }).length;
}