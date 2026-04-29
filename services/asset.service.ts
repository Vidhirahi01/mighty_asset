import { supabase } from "@/lib/supabase";

export type Asset = {
    id: string;
    asset_name: string;
    category: string | null;
    brand: string | null;
    model_no: string | null;
    quantity: number | null;
    minimum_stock_level: number | null;
    status: string | null;
    condition: string | null;
    image_url: string | null;
    note: string | null;
};

export type ManagerRequest = {
    id: string;
    email: string | null;
    type: string | null;
    status: string | null;
    reason: string | null;
    category: string | null;
    quantity: number | null;
    created_at: string;
    requester_name?: string | null;
};

export type RequestSummary = {
    pendingApprovals: number;
    openIssues: number;
};

export type PopularAssetCategory = {
    key: string;
    label: string;
    total: number;
    requestCount: number;
};

const normalizeCategoryKey = (value: string | null | undefined) => {
    const normalized = (value ?? '').trim().toLowerCase();

    if (normalized.startsWith('laptop')) return 'laptops';
    if (normalized.startsWith('monitor')) return 'monitors';
    if (normalized.startsWith('keyboard')) return 'keyboards';
    if (normalized.startsWith('cable')) return 'cables';
    if (normalized === 'mouse' || normalized === 'mice') return 'mouse';
    if (normalized.startsWith('printer')) return 'printers';
    if (normalized.startsWith('tablet')) return 'tablets';

    return normalized || 'uncategorized';
};

const categoryLabelFromKey = (key: string) => {
    switch (key) {
        case 'laptops': return 'Laptops';
        case 'monitors': return 'Monitors';
        case 'keyboards': return 'Keyboards';
        case 'cables': return 'Cables';
        case 'mouse': return 'Mouse';
        case 'printers': return 'Printers';
        case 'tablets': return 'Tablets';
        default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
};

export const getAssets = async (category?: string) => {
    let query = supabase.from('asset_table').select('*');

    if (category && category !== 'All') {
        query = query.eq('category', category.toLowerCase());
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Asset[];
};

export const getPopularAssetCategories = async (): Promise<PopularAssetCategory[]> => {
    const [{ data: requestData, error: requestError }, { data: assetData, error: assetError }] = await Promise.all([
        supabase
            .from('request_table')
            .select('category, created_at')
            .eq('type', 'ASSET_REQUEST')
            .order('created_at', { ascending: false }),
        supabase
            .from('asset_table')
            .select('category'),
    ]);

    if (requestError) throw requestError;
    if (assetError) throw assetError;

    const requestFrequency = new Map<string, number>();
    for (const row of (requestData ?? []) as Array<{ category: string | null }>) {
        const key = normalizeCategoryKey(row.category);
        requestFrequency.set(key, (requestFrequency.get(key) ?? 0) + 1);
    }

    const assetTotals = new Map<string, number>();
    for (const row of (assetData ?? []) as Array<{ category: string | null }>) {
        const key = normalizeCategoryKey(row.category);
        assetTotals.set(key, (assetTotals.get(key) ?? 0) + 1);
    }

    return Array.from(requestFrequency.entries())
        .map(([key, requestCount]) => ({
            key,
            label: categoryLabelFromKey(key),
            total: assetTotals.get(key) ?? 0,
            requestCount,
        }))
        .sort((a, b) => {
            if (b.requestCount !== a.requestCount) return b.requestCount - a.requestCount;
            return b.total - a.total;
        })
        .slice(0, 4);
};

export const getManagerRequests = async (): Promise<ManagerRequest[]> => {
    const { data, error } = await supabase
        .from('request_table')
        .select('id, email, type, status, reason, category, quantity, created_at')
        .eq('type', 'ASSET_REQUEST')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as ManagerRequest[];
};

export const getRequestSummary = async (): Promise<RequestSummary> => {
    const { data: pendingData, error: pendingError } = await supabase
        .from('request_table')
        .select('id')
        .eq('type', 'ASSET_REQUEST')
        .eq('status', 'PENDING');

    if (pendingError) throw pendingError;

    const { data: issueData, error: issueError } = await supabase
        .from('request_table')
        .select('id')
        .eq('type', 'ISSUE_REPORT')
        .eq('status', 'PENDING');

    if (issueError) throw issueError;

    return {
        pendingApprovals: (pendingData ?? []).length,
        openIssues: (issueData ?? []).length,
    };
};