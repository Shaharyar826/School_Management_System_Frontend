import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { queryKeys } from '../config/queryClient';
import { cacheKeys, readCache, resolveTenantIdentifier, writeCache } from '../utils/appCache';

// Get dashboard statistics
export const useDashboardStats = (role) => {
  const tenantIdentifier = resolveTenantIdentifier();
  const cachedStats = tenantIdentifier && role ? readCache(cacheKeys.dashboardStats(tenantIdentifier, role), null) : null;

  return useQuery({
    queryKey: queryKeys.dashboard.stats(role, tenantIdentifier),
    queryFn: async () => {
      const response = await dashboardApi.getStats(role);
      return response?.data ?? response;
    },
    enabled: !!role,
    initialData: cachedStats?.data ?? undefined,
    initialDataUpdatedAt: cachedStats?.updatedAt ?? 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (tenantIdentifier && role) {
        writeCache(cacheKeys.dashboardStats(tenantIdentifier, role), {
          data,
          updatedAt: Date.now(),
        });
      }
    },
  });
};

// Get dashboard charts data
export const useDashboardCharts = (role, period = 'month') => {
  const tenantIdentifier = resolveTenantIdentifier();

  return useQuery({
    queryKey: queryKeys.dashboard.charts(role, period, tenantIdentifier),
    queryFn: () => dashboardApi.getCharts(role, period),
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes - chart data is more stable
    select: (data) => data?.data,
  });
};