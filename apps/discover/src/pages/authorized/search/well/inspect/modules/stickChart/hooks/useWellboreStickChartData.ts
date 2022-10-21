import { WellboreStickChartData } from '../types';
import { getDataWithLoadingStatus } from '../utils/getDataWithLoadingStatus';

import { useCasingsColumnsData } from './useCasingsColumnsData';
import { useFormationColumnsData } from './useFormationColumnsData';
import { useHeaderExtraData } from './useHeaderExtraData';
import { useHoleSectionsColumnsData } from './useHoleSectionsColumnsData';
import { useMeasurementsColumnsData } from './useMeasurementsColumnsData';
import { useNdsColumnsData } from './useNdsColumnsData';
import { useNptColumnsData } from './useNptColumnsData';
import { useTrajectoryColumnsData } from './useTrajectoryColumnsData';

export const useWellboreStickChartData = () => {
  const headerExtraData = useHeaderExtraData();
  const formationColumnsData = useFormationColumnsData();
  const casingsColumnsData = useCasingsColumnsData();
  const nptColumnsData = useNptColumnsData();
  const ndsColumnsData = useNdsColumnsData();
  const trajectoryColumnsData = useTrajectoryColumnsData();
  const measurementsColumnsData = useMeasurementsColumnsData();
  const holeSectionsColumnsData = useHoleSectionsColumnsData();

  return (wellboreMatchingId: string): WellboreStickChartData => ({
    headerExtraData: headerExtraData[wellboreMatchingId],
    formationColumn: getDataWithLoadingStatus(
      formationColumnsData,
      wellboreMatchingId
    ),
    casingsColumn: getDataWithLoadingStatus(
      casingsColumnsData,
      wellboreMatchingId
    ),
    nptColumn: getDataWithLoadingStatus(nptColumnsData, wellboreMatchingId),
    ndsColumn: getDataWithLoadingStatus(ndsColumnsData, wellboreMatchingId),
    trajectoryColumn: getDataWithLoadingStatus(
      trajectoryColumnsData,
      wellboreMatchingId
    ),
    measurementsColumn: getDataWithLoadingStatus(
      measurementsColumnsData,
      wellboreMatchingId
    ),
    holeSectionsColumn: getDataWithLoadingStatus(
      holeSectionsColumnsData,
      wellboreMatchingId
    ),
  });
};
