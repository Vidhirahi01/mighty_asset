import { supabase } from "@/lib/supabase";

export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*');

  if (error) throw error;
  return data;
};