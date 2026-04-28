import { supabase } from '@/lib/supabase';

export type IssueWorkflowStatus = 'PENDING_REVIEW' | 'PROGRESS_REVIEW' | 'ACTIVE' | 'RESOLVED';

export type CreateIssueInput = {
    assetId: string;
    reportedBy: string;
    type: string;
    title: string;
    priority: string;
    startedAt: string;
    description: string;
    attachments?: string[];
};

export type IssueDescriptionMeta = {
    title: string;
    priority: string;
    startedAt: string;
    details: string;
    attachments: string[];
    assignedTechnician: string;
};

export type TechnicianUser = {
    id: string;
    name: string;
    email: string | null;
};

export type IssueListItem = {
    id: string;
    createdAt: string;
    status: IssueWorkflowStatus;
    type: string | null;
    assetId: string | null;
    assetName: string;
    assetCategory: string;
    reportedById: string | null;
    reportedByName: string;
    reportedByEmail: string;
    metadata: IssueDescriptionMeta;
};

const DEFAULT_TECHNICIAN = 'Unassigned';
const ISSUE_STATUS_PENDING_REVIEW: IssueWorkflowStatus = 'PENDING_REVIEW';

const normalizeStatus = (value: string | null | undefined): IssueWorkflowStatus => {
    const raw = String(value ?? '').trim().toUpperCase();
    if (raw === 'RESOLVED') return 'RESOLVED';
    if (raw === 'ACTIVE') return 'ACTIVE';
    if (raw === 'PROGRESS_REVIEW') return 'PROGRESS_REVIEW';
    return 'PENDING_REVIEW';
};

const parseDescriptionLine = (lines: string[], prefix: string, fallback: string) => {
    const line = lines.find((item) => item.startsWith(prefix));
    if (!line) return fallback;
    return line.replace(prefix, '').trim() || fallback;
};

const parseAttachments = (value: string) => {
    if (!value || value.toLowerCase() === 'none') return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

export const buildIssueDescription = (input: Omit<CreateIssueInput, 'assetId' | 'reportedBy' | 'type'>) => {
    const lines = [
        `Title: ${input.title.trim()}`,
        `Priority: ${input.priority}`,
        `Started At: ${input.startedAt.trim()}`,
        `Description: ${input.description.trim()}`,
        `Attachments: ${(input.attachments ?? []).length > 0 ? (input.attachments ?? []).join(', ') : 'None'}`,
        `Assigned Technician: ${DEFAULT_TECHNICIAN}`,
    ];

    return lines.join('\n');
};

export const parseIssueDescription = (description: string | null | undefined): IssueDescriptionMeta => {
    const text = String(description ?? '').trim();
    const lines = text.split('\n').map((line) => line.trim());

    const title = parseDescriptionLine(lines, 'Title: ', 'Untitled Issue');
    const priority = parseDescriptionLine(lines, 'Priority: ', 'medium');
    const startedAt = parseDescriptionLine(lines, 'Started At: ', 'Not specified');
    const details = parseDescriptionLine(lines, 'Description: ', text || 'No issue description provided.');
    const attachments = parseAttachments(parseDescriptionLine(lines, 'Attachments: ', 'None'));
    const assignedTechnician = parseDescriptionLine(lines, 'Assigned Technician: ', DEFAULT_TECHNICIAN);

    return {
        title,
        priority,
        startedAt,
        details,
        attachments,
        assignedTechnician,
    };
};

const toIssueListItem = (row: {
    id: string;
    created_at: string;
    status: string | null;
    type: string | null;
    asset_id: string | null;
    reported_by: string | null;
    description: string | null;
    asset: { asset_name?: string | null; category?: string | null } | null;
    reporter: { name?: string | null; email?: string | null } | null;
}): IssueListItem => {
    const metadata = parseIssueDescription(row.description);

    return {
        id: row.id,
        createdAt: row.created_at,
        status: normalizeStatus(row.status),
        type: row.type,
        assetId: row.asset_id,
        assetName: row.asset?.asset_name?.trim() || 'Unknown Asset',
        assetCategory: row.asset?.category?.trim() || 'Uncategorized',
        reportedById: row.reported_by,
        reportedByName: row.reporter?.name?.trim() || 'Employee',
        reportedByEmail: row.reporter?.email?.trim() || 'unknown@company.com',
        metadata,
    };
};

export async function createIssue(input: CreateIssueInput): Promise<{ id: string }> {
    const issueDescription = buildIssueDescription({
        title: input.title,
        priority: input.priority,
        startedAt: input.startedAt,
        description: input.description,
        attachments: input.attachments,
    });

    const { data, error } = await supabase
        .from('issues_table')
        .insert([
            {
                asset_id: input.assetId,
                reported_by: input.reportedBy,
                description: issueDescription,
                status: ISSUE_STATUS_PENDING_REVIEW,
                type: input.type,
            },
        ])
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message || 'Failed to create issue.');
    }

    return { id: String(data.id) };
}

export async function getIssuesForOperations(): Promise<IssueListItem[]> {
    const { data, error } = await supabase
        .from('issues_table')
        .select('id, created_at, status, type, asset_id, reported_by, description, asset:asset_id(asset_name, category), reporter:reported_by(name, email)')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message || 'Failed to load issues.');
    }

    return ((data ?? []) as Array<{
        id: string;
        created_at: string;
        status: string | null;
        type: string | null;
        asset_id: string | null;
        reported_by: string | null;
        description: string | null;
        asset: { asset_name?: string | null; category?: string | null } | null;
        reporter: { name?: string | null; email?: string | null } | null;
    }>).map(toIssueListItem);
}

export async function getIssuesByReporter(reportedBy: string): Promise<IssueListItem[]> {
    const { data, error } = await supabase
        .from('issues_table')
        .select('id, created_at, status, type, asset_id, reported_by, description, asset:asset_id(asset_name, category), reporter:reported_by(name, email)')
        .eq('reported_by', reportedBy)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message || 'Failed to load user issues.');
    }

    return ((data ?? []) as Array<{
        id: string;
        created_at: string;
        status: string | null;
        type: string | null;
        asset_id: string | null;
        reported_by: string | null;
        description: string | null;
        asset: { asset_name?: string | null; category?: string | null } | null;
        reporter: { name?: string | null; email?: string | null } | null;
    }>).map(toIssueListItem);
}

export async function updateIssueStatus(issueId: string, status: IssueWorkflowStatus): Promise<void> {
    const { error } = await supabase
        .from('issues_table')
        .update({ status })
        .eq('id', issueId);

    if (error) {
        throw new Error(error.message || 'Failed to update issue status.');
    }
}

export async function assignIssueTechnician(params: {
    issueId: string;
    technicianId: string;
    technicianName: string;
    assignedById?: string | null;
    activate?: boolean;
}): Promise<void> {
    const { data: row, error: readError } = await supabase
        .from('issues_table')
        .select('description, asset_id')
        .eq('id', params.issueId)
        .single();

    if (readError) {
        throw new Error(readError.message || 'Failed to load issue details.');
    }

    const issueRow = row as { description?: string | null; asset_id?: string | null };
    const assetId = issueRow?.asset_id ?? null;

    if (!assetId) {
        throw new Error('Issue is missing asset information.');
    }

    const meta = parseIssueDescription(issueRow?.description ?? null);

    const merged = [
        `Title: ${meta.title}`,
        `Priority: ${meta.priority}`,
        `Started At: ${meta.startedAt}`,
        `Description: ${meta.details}`,
        `Attachments: ${meta.attachments.length > 0 ? meta.attachments.join(', ') : 'None'}`,
        `Assigned Technician: ${params.technicianName.trim() || DEFAULT_TECHNICIAN}`,
    ].join('\n');

    const updatePayload: { description: string; status?: IssueWorkflowStatus } = {
        description: merged,
    };

    if (params.activate) {
        updatePayload.status = 'ACTIVE';
    }

    const assignedAt = new Date().toISOString();

    const { error: assignError } = await supabase
        .from('assign_table')
        .insert({
            asset_id: assetId,
            assigned_by: params.assignedById ?? null,
            assigned_to: params.technicianId,
            assigned_at: assignedAt,
            status: params.activate ? 'ACTIVE' : 'ASSIGNED',
        });

    if (assignError) {
        throw new Error(assignError.message || 'Failed to create assignment record.');
    }

    const { error: repairError } = await supabase
        .from('repair_table')
        .insert({
            asset_id: assetId,
            technician_id: params.technicianId,
            status: params.activate ? 'ACTIVE' : 'ASSIGNED',
            notes: `Assigned from issue ${params.issueId}`,
        });

    if (repairError) {
        throw new Error(repairError.message || 'Failed to create repair record.');
    }

    const { error: updateError } = await supabase
        .from('issues_table')
        .update(updatePayload)
        .eq('id', params.issueId);

    if (updateError) {
        throw new Error(updateError.message || 'Failed to assign technician.');
    }
}

export async function getIssuesForTechnician(technicianId: string): Promise<IssueListItem[]> {
    const techId = technicianId.trim();
    if (!techId) return [];

    const { data: repairs, error: repairError } = await supabase
        .from('repair_table')
        .select('asset_id')
        .eq('technician_id', techId);

    if (repairError) {
        throw new Error(repairError.message || 'Failed to load technician repairs.');
    }

    const assetIds = Array.from(
        new Set(
            (repairs ?? [])
                .map((row) => row.asset_id)
                .filter((assetId): assetId is string => Boolean(assetId))
        )
    );

    if (assetIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('issues_table')
        .select('id, created_at, status, type, asset_id, reported_by, description, asset:asset_id(asset_name, category), reporter:reported_by(name, email)')
        .in('asset_id', assetIds)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message || 'Failed to load technician issues.');
    }

    return ((data ?? []) as Array<{
        id: string;
        created_at: string;
        status: string | null;
        type: string | null;
        asset_id: string | null;
        reported_by: string | null;
        description: string | null;
        asset: { asset_name?: string | null; category?: string | null } | null;
        reporter: { name?: string | null; email?: string | null } | null;
    }>).map(toIssueListItem);
}

export async function saveRepairProgress(params: {
    assetId: string;
    technicianId: string;
    status: string;
    notes: string;
}) {
    const { data, error } = await supabase
        .from('repair_table')
        .select('id')
        .eq('asset_id', params.assetId)
        .eq('technician_id', params.technicianId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        throw new Error(error.message || 'Failed to load repair record.');
    }

    const repairId = data?.[0]?.id as string | undefined;
    const payload = {
        asset_id: params.assetId,
        technician_id: params.technicianId,
        status: params.status,
        notes: params.notes,
    };

    if (repairId) {
        const { error: updateError } = await supabase
            .from('repair_table')
            .update(payload)
            .eq('id', repairId);

        if (updateError) {
            throw new Error(updateError.message || 'Failed to update repair record.');
        }

        return { id: repairId };
    }

    const { data: created, error: insertError } = await supabase
        .from('repair_table')
        .insert(payload)
        .select('id')
        .single();

    if (insertError) {
        throw new Error(insertError.message || 'Failed to create repair record.');
    }

    return { id: String(created.id) };
}

export async function getIssueTechnicians(): Promise<TechnicianUser[]> {
    const { data, error } = await supabase
        .from('user_table')
        .select('id, name, email, role, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        throw new Error(error.message || 'Failed to load technicians.');
    }

    const users = (data ?? []) as Array<{
        id: string;
        name: string | null;
        email: string | null;
        role: string | null;
        is_active: boolean | null;
    }>;

    return users
        .filter((user) => {
            const role = String(user.role ?? '').toUpperCase();
            return role === 'TECHNICIAN';
        })
        .map((user) => ({
            id: user.id,
            name: user.name?.trim() || user.email || 'Technician',
            email: user.email,
        }));
}

export async function getOpenIssueCountByReporter(reportedBy: string): Promise<number> {
    const { data, error } = await supabase
        .from('issues_table')
        .select('status')
        .eq('reported_by', reportedBy);

    if (error) {
        throw new Error(error.message);
    }

    const rows = (data ?? []) as Array<{ status: string | null }>;

    return rows.filter((row) => {
        const status = normalizeStatus(row.status);
        return status === 'PENDING_REVIEW' || status === 'PROGRESS_REVIEW' || status === 'ACTIVE';
    }).length;
}
