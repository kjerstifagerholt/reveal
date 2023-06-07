import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import dayjs from 'dayjs';
import { getProject } from '@cognite/cdf-utilities';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicCharts } from '@charts-app/services/charts-storage';
import { ChartItem } from '../types';

const usePublicCharts = () => {
  const { data: { id } = {} } = useUserInfo();
  const project = getProject();

  return useQuery(
    ['charts', 'publicCharts'],
    async () => fetchPublicCharts(project),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      select: (charts) =>
        charts.map((chart): ChartItem => {
          return {
            id: chart.id,
            name: chart.name,
            owner: chart.userInfo?.displayName ?? '',
            updatedAt: dayjs(chart.updatedAt).toISOString(),
            firebaseChart: chart,
          };
        }),
    }
  );
};

export default usePublicCharts;
