
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getAssets, getPopularAssetCategories } from '@/services/asset.service';

const AssetStatus = (value: string | null | undefined) => {
    const status = (value ?? '').toLowerCase().replace(/[_\s-]/g, '');
    if (status === 'available') return 'available';
    if (status === 'assigned' || status === 'inuse') return 'assigned';
    if (status === 'inrepair' || status === 'repair' || status === 'maintenance') return 'in_repair';
    return 'other';
};

export function useAssets(category?: string) {
    return useQuery({
        queryKey: ['assets', category],
        queryFn: () => getAssets(category),
    });
}

export function useAssetStats() {
    return useQuery({
        queryKey: queryKeys.assets.stats,
        queryFn: async () => {
            const assets = await getAssets();
            return {
                total: assets.length,
                available: assets.filter(a => AssetStatus(a.status) === 'available').length,
                assigned: assets.filter(a => AssetStatus(a.status) === 'assigned').length,
                inRepair: assets.filter(a => AssetStatus(a.status) === 'in_repair').length,
            };
        },
    });
}

export function usePopularAssetCategories() {
    return useQuery({
        queryKey: ['assets', 'popular-categories'],
        queryFn: getPopularAssetCategories,
    });
}