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
export const getAssets = async (category?: string) => {
  let query = supabase.from('asset_table').select('*');

  if (category && category !== 'All') {
    query = query.eq('category', category.toLowerCase());
  }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Asset[];
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