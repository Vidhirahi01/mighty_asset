
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getAssets } from '@/services/asset.service';

export function useAssets() {
    return useQuery({
        queryKey: queryKeys.assets.all,
        queryFn: getAssets,
    });
}

export function useAssetStats() {
    return useQuery({
        queryKey: queryKeys.assets.stats,
        queryFn: async () => {
            const assets = await getAssets();
            return {
                total: assets.length,
                available: assets.filter(a => a.status === 'available').length,
                assigned: assets.filter(a => a.status === 'assigned').length,
                inRepair: assets.filter(a => a.status === 'in_repair').length,
            };
        },
    });
}