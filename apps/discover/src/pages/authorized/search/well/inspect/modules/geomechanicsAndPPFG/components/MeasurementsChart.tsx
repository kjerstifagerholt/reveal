import React from 'react';

import { ChartV2 } from '../../common/ChartV2';
import { ChartProps } from '../../common/ChartV2/ChartV2';
import { MeasurementCurveData, MeasurementUnits } from '../types';

export const AXIS_AUTO_RANGE: ChartProps['axisAutorange'] = {
  y: 'reversed',
};

export interface MeasurementsChartProps extends ChartProps {
  data: MeasurementCurveData[];
  measurementUnits: MeasurementUnits;
}

export const MeasurementsChart: React.FC<MeasurementsChartProps> = ({
  measurementUnits,
  ...props
}) => {
  const { pressureUnit, depthMeasurementType, depthUnit } = measurementUnits;

  return (
    <ChartV2
      autosize
      adaptiveChart
      axisNames={{
        x: `Pressure (${pressureUnit.toLowerCase()})`,
        x2: 'Angle (deg)',
        y: `${depthMeasurementType} (${depthUnit})`,
      }}
      axisAutorange={AXIS_AUTO_RANGE}
      {...props}
    />
  );
};
