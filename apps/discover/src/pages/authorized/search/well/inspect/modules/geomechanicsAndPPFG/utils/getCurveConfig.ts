import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import { MEASUREMENT_CURVE_CONFIG } from '../config/curveConfig';

import { isMeasurementTypeFitOrLot } from './isMeasurementTypeFitOrLot';

export const getCurveConfig = (column: DepthMeasurementDataColumnInternal) => {
  const { measurementTypeParent, externalId } = column;

  if (!measurementTypeParent) {
    return null;
  }

  const curveConfigCategory = MEASUREMENT_CURVE_CONFIG[measurementTypeParent];

  return curveConfigCategory[externalId] || curveConfigCategory.default;
};

export const hasCurveConfig = (column: DepthMeasurementDataColumnInternal) => {
  const { measurementTypeParent, externalId } = column;

  if (!measurementTypeParent) {
    return false;
  }

  // Since FIT and LOT curves have default curve config only.
  if (isMeasurementTypeFitOrLot(measurementTypeParent)) {
    return true;
  }

  const curveConfigCategory = MEASUREMENT_CURVE_CONFIG[measurementTypeParent];

  return Boolean(curveConfigCategory[externalId]);
};
