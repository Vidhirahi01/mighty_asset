import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getReturnRequest } from "@/services/request.service";

export const useReturnRequests = (userId?: string, email?: string) => {
    const keyIdentity = userId || email || 'all';

    return useQuery({
        queryKey: queryKeys.requests.returnRequests(keyIdentity),
        queryFn: () =>
            getReturnRequest({
                userId,
                email,
            }),
        enabled: true,
    });
};