import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

export const isMeasurementTypeFitOrLot = (
  measurementType: MeasurementTypeParent
) => {
  return [MeasurementTypeParent.FIT, MeasurementTypeParent.LOT].includes(
    measurementType
  );
};
