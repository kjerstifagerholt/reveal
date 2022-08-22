import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

import { MeasurementUnits } from '../types';

import { getRowValues } from './getRowValues';

export const getCurveValues = ({
  column,
  columnIndex,
  rows,
  measurementUnits,
}: {
  column: DepthMeasurementDataColumnInternal;
  columnIndex: number;
  rows: DepthMeasurementRow[];
  measurementUnits: MeasurementUnits;
}) => {
  return rows.reduce(
    ({ x, y }, row, rowIndex) => {
      const { depthValue, columnValue } = getRowValues({
        column,
        columnIndex,
        row,
        rowIndex,
        measurementUnits,
      });

      return {
        x: [...x, columnValue],
        y: [...y, depthValue],
      };
    },
    { x: [], y: [] } as { x: (number | null)[]; y: (number | null)[] }
  );
};
