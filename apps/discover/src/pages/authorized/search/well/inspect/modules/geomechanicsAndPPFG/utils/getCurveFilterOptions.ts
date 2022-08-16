import uniqBy from 'lodash/uniqBy';

import { CurvesFilterType, MeasurementsView, MeasurementType } from '../types';

const initialCurveFilterOptions = Object.values(CurvesFilterType).reduce(
  (optionsMap, filterType) => ({
    ...optionsMap,
    [filterType]: [],
  }),
  {} as Record<CurvesFilterType, string[]>
);

export const getCurveFilterOptions = (data: MeasurementsView[]) => {
  const allColumns = data.flatMap(({ columns }) => columns);
  const uniqueColumns = uniqBy(allColumns, 'externalId');

  return uniqueColumns.reduce(
    (optionsMap, { externalId, measurementTypeParent }) => {
      if (!measurementTypeParent) {
        return optionsMap;
      }

      switch (measurementTypeParent) {
        case MeasurementType.GEOMECHANNICS:
          return mergeCurveFilterOption(
            optionsMap,
            CurvesFilterType.GEOMECHANNICS,
            externalId
          );
        case MeasurementType.PPFG:
          return mergeCurveFilterOption(
            optionsMap,
            CurvesFilterType.PPFG,
            externalId
          );
        default:
          return mergeCurveFilterOption(
            optionsMap,
            CurvesFilterType.OTHER,
            externalId
          );
      }
    },
    initialCurveFilterOptions
  );
};

export const mergeCurveFilterOption = (
  optionsMap: Record<CurvesFilterType, string[]>,
  filterType: CurvesFilterType,
  option: string
) => {
  return {
    ...optionsMap,
    [filterType]: [...optionsMap[filterType], option],
  };
};
