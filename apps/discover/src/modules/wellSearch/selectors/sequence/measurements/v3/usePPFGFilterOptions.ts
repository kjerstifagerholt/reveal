import { useMemo } from 'react';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQueryV3';

import { getUniqPpfgCurves } from './utils';

/**
 * Find unique ppfg measurement types from the available data
 */
export const usePPFGFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    return { curves: getUniqPpfgCurves(data) };
  }, [data]);
};
