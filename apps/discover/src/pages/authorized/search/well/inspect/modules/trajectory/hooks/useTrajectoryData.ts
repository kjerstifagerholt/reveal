import { useTrajectoriesWithData } from 'domain/wells/trajectory/internal/hooks/useTrajectoriesWithData';
import { useWellInspectSelectedWellboresKeyed } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboresKeyed';

import { useMemo } from 'react';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { adaptToTrajectoryView } from '../utils/adaptToTrajectoryView';

export const useTrajectoryData = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellbores = useWellInspectSelectedWellboresKeyed();

  const { data, isLoading } = useTrajectoriesWithData({ wellboreIds });

  const adaptedData = useMemo(
    () =>
      data.map((trajectory) => {
        const { wellboreMatchingId } = trajectory;
        const wellbore = wellbores[wellboreMatchingId];

        return adaptToTrajectoryView(trajectory, wellbore);
      }),
    [data]
  );

  return {
    data: adaptedData,
    isLoading,
  };
};
