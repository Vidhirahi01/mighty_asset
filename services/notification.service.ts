import { supabase } from '@/lib/supabase';

interface NotifyPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  assetId?: string;
  repairId?: string;
  requestId?: string;
  assignmentId?: string;
}

export const notifyUser = async (payload: NotifyPayload) => {
  await supabase.from('notification_table').insert({
    user_id: payload.userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    asset_id: payload.assetId ?? null,
    repair_id: payload.repairId ?? null,
    request_id: payload.requestId ?? null,
    assignment_id: payload.assignmentId ?? null,
    is_read: false,
  });
};

export const notifyByRole = async (
  role: string,
  payload: Omit<NotifyPayload, 'userId'>
) => {
  const { data: users } = await supabase
    .from('user_table')
    .select('id')
    .eq('role', role);

  if (!users?.length) return;

  const rows = users.map(user => ({
    user_id: user.id,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    asset_id: payload.assetId ?? null,
    repair_id: payload.repairId ?? null,
    request_id: payload.requestId ?? null,
    assignment_id: payload.assignmentId ?? null,
    is_read: false,
  }));

  await supabase.from('notification_table').insert(rows);
};

export const notifyRoles = async (
  roles: string[],
  payload: Omit<NotifyPayload, 'userId'>
) => {
  await Promise.all(roles.map(role => notifyByRole(role, payload)));
};