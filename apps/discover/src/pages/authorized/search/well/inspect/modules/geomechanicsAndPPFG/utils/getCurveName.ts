import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

export const getCurveName = (column: DepthMeasurementDataColumnInternal) => {
  const { externalId, measurementTypeParent } = column;

  if (
    !measurementTypeParent ||
    externalId.toLowerCase() === measurementTypeParent.toLowerCase()
  ) {
    return externalId;
  }

  return `${externalId} (${measurementTypeParent})`;
};
