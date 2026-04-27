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

export type WorkflowRequestStatus =
    | RequestStatus
    | 'PURCHASE_PENDING';

export type ManagerRequestRow = {
    id: string;
    created_at: string;
    email: string | null;
    user_id?: string | null;
    requester_name?: string | null;
    category: string | null;
    reason: string | null;
    status: WorkflowRequestStatus;
    quantity: number | null;
};

export type OperationsAssignmentRequest = {
    id: string;
    created_at: string;
    email: string | null;
    user_id: string | null;
    category: string | null;
    reason: string | null;
    quantity: number | null;
    status: WorkflowRequestStatus;
    requester_name: string | null;
    department: string | null;
    role: string | null;
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
    status: WorkflowRequestStatus;
    approvedAt: string;
    requestedBy: string | null;
    reason: string | null;
    brand: string | null;
    modelNo: string | null;
    condition: string | null;
    note: string | null;
    imageUrl: string | null;
};

export type EmployeeAssetRequest = {
    requestId: string;
    createdAt: string;
    status: WorkflowRequestStatus;
    category: string | null;
    quantity: number;
    reason: string | null;
    assignedAssetId: string | null;
    assignedAssetName: string | null;
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

export async function updateWorkflowRequestStatus(requestId: string, status: WorkflowRequestStatus) {
    const { error } = await supabase
        .from('request_table')
        .update({ status })
        .eq('id', requestId);

    if (error) throw new Error(error.message);
}

export async function getOperationsAssignmentRequests(): Promise<OperationsAssignmentRequest[]> {
    const { data, error } = await supabase
        .from('request_table')
        .select('id, created_at, email, user_id, category, reason, quantity, status, type, asset_id')
        .in('status', ['APPROVED', 'PURCHASE_PENDING'])
        .is('asset_id', null)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<{
        id: string;
        created_at: string;
        email: string | null;
        user_id: string | null;
        category: string | null;
        reason: string | null;
        quantity: number | null;
        status: WorkflowRequestStatus;
        type?: string | null;
        asset_id?: string | null;
    }>;

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

    const userMetaById = new Map<string, { name: string | null; department: string | null; role: string | null }>();

    if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
            .from('user_table')
            .select('id, name, department, role')
            .in('id', userIds);

        if (!usersError && users) {
            for (const user of users as Array<{ id: string; name?: string | null; department?: string | null; role?: string | null }>) {
                userMetaById.set(String(user.id), {
                    name: user.name ?? null,
                    department: user.department ?? null,
                    role: user.role ?? null,
                });
            }
        }
    }

    return filteredRows.map((row) => {
        const userMeta = row.user_id ? userMetaById.get(String(row.user_id)) : undefined;
        return {
            id: row.id,
            created_at: row.created_at,
            email: row.email,
            user_id: row.user_id,
            category: row.category,
            reason: row.reason,
            quantity: row.quantity,
            status: row.status,
            requester_name: userMeta?.name ?? null,
            department: userMeta?.department ?? null,
            role: userMeta?.role ?? null,
        } satisfies OperationsAssignmentRequest;
    });
}

export async function assignAssetToEmployee(input: {
    requestId: string;
    assetId: string;
    assigneeUserId?: string | null;
    assigneeEmail?: string | null;
    assignDate: string;
    assignmentType: string;
    expectedReturn?: string | null;
    notes?: string;
    accessories?: string[];
}) {
    const assignee = input.assigneeUserId || input.assigneeEmail || null;
    if (!assignee) {
        throw new Error('Missing assignee identity for assignment.');
    }

    const assignmentMemo = [
        `Assigned On: ${input.assignDate}`,
        `Assignment Type: ${input.assignmentType}`,
        `Expected Return: ${input.expectedReturn || 'N/A'}`,
        `Accessories: ${(input.accessories ?? []).join(', ') || 'None'}`,
        `Ops Notes: ${input.notes?.trim() || 'None'}`,
    ].join('\n');

    const { error: assetError } = await supabase
        .from('asset_table')
        .update({
            status: 'ASSIGNED',
            assigned_to: assignee,
            note: assignmentMemo,
        })
        .eq('id', input.assetId);

    if (assetError) {
        throw new Error(assetError.message || 'Failed to assign asset.');
    }

    const { data: existingRequest, error: requestReadError } = await supabase
        .from('request_table')
        .select('reason')
        .eq('id', input.requestId)
        .single();

    if (requestReadError) {
        throw new Error(requestReadError.message || 'Failed to read request details.');
    }

    const mergedReason = [String(existingRequest?.reason ?? '').trim(), assignmentMemo]
        .filter(Boolean)
        .join('\n\n');

    const { error: requestUpdateError } = await supabase
        .from('request_table')
        .update({
            status: 'APPROVED',
            asset_id: input.assetId,
            reason: mergedReason,
        })
        .eq('id', input.requestId);

    if (requestUpdateError) {
        throw new Error(requestUpdateError.message || 'Failed to update request assignment.');
    }
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
        .eq('status', 'APPROVED')
        .not('asset_id', 'is', null);

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

export async function getEmployeeAssetRequests(params: {
    userId?: string | null;
    email?: string | null;
}): Promise<EmployeeAssetRequest[]> {
    const userId = params.userId?.trim() || null;
    const email = params.email?.trim() || null;

    if (!userId && !email) {
        return [];
    }

    let query = supabase
        .from('request_table')
        .select('id, created_at, status, category, quantity, reason, type, asset_id, user_id, email');

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

    const requestRows = ((data ?? []) as Array<{
        id: string;
        created_at: string;
        status: WorkflowRequestStatus;
        category: string | null;
        quantity: number | null;
        reason: string | null;
        type: string | null;
        asset_id: string | null;
    }>).filter((row) => {
        const type = String(row.type ?? '').toUpperCase();
        return type === 'ASSET_REQUEST' || type === 'ASSET-REQUEST' || type === 'ASSETREQUEST';
    });

    if (requestRows.length === 0) {
        return [];
    }

    const assetIds = Array.from(
        new Set(
            requestRows
                .map((row) => row.asset_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    let assetNameById = new Map<string, string>();

    if (assetIds.length > 0) {
        const { data: assets, error: assetsError } = await supabase
            .from('asset_table')
            .select('id, asset_name')
            .in('id', assetIds);

        if (assetsError) {
            throw new Error(assetsError.message);
        }

        assetNameById = new Map(
            ((assets ?? []) as Array<{ id: string; asset_name: string | null }>).map((asset) => [
                asset.id,
                asset.asset_name?.trim() || 'Assigned Asset',
            ])
        );
    }

    return requestRows.map((row) => ({
        requestId: row.id,
        createdAt: row.created_at,
        status: row.status,
        category: row.category,
        quantity: Number(row.quantity ?? 1),
        reason: row.reason,
        assignedAssetId: row.asset_id,
        assignedAssetName: row.asset_id ? (assetNameById.get(row.asset_id) || 'Assigned Asset') : null,
    }));
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