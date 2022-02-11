import React from 'react';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { WellboreId } from 'modules/wellSearch/types';

import { WellSequenceData } from '../types';
import { filterWellSequenceDataByWellboreIds } from '../utils';

import { useFetchSequenceData } from './useFetchSequenceData';
import { useTrajectoryQueriesFiltersByKey } from './useTrajectoryQueriesFiltersByKey';

export const useWellLogsQuery = (
  requiredWellboreIds: WellboreId[] = []
): UseQueryResult<WellSequenceData> => {
  const queryClient = useQueryClient();
  const { data: wellConfig } = useWellConfig();
  const filters = useTrajectoryQueriesFiltersByKey('logs');
  const fetchSequenceData = useFetchSequenceData();

  const wellLogs =
    queryClient.getQueryData<WellSequenceData>(WELL_QUERY_KEY.LOGS) || {};

  const prestineWellboreIds = useDeepMemo(() => {
    const wellLogsFetchedWellboreIds = Object.keys(wellLogs);
    return difference(requiredWellboreIds, wellLogsFetchedWellboreIds);
  }, [requiredWellboreIds]);

  const updateWellLogsForPrestineWellboreIds = async () => {
    if (isEmpty(prestineWellboreIds)) {
      return wellLogs;
    }
    const updatedWellLogs: WellSequenceData = {
      ...wellLogs,
      ...(await fetchSequenceData(prestineWellboreIds, filters)),
    };
    queryClient.setQueryData(WELL_QUERY_KEY.LOGS, updatedWellLogs);
    return updatedWellLogs;
  };

  useDeepEffect(() => {
    updateWellLogsForPrestineWellboreIds();
  }, [prestineWellboreIds]);

  return useQuery<WellSequenceData>(
    WELL_QUERY_KEY.LOGS,
    updateWellLogsForPrestineWellboreIds,
    {
      enabled: wellConfig?.disabled !== true,
      select: React.useCallback(
        (wellLogs) => {
          return filterWellSequenceDataByWellboreIds(
            wellLogs,
            requiredWellboreIds
          );
        },
        [requiredWellboreIds]
      ),
    }
  );
};
