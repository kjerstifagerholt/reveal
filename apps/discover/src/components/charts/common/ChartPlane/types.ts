import { Dimensions, Margins } from 'components/charts/types';

import { AxisPlacement, AxisProps, AxisScale } from '../Axis';

export interface ChartPlaneProps {
  xScale: AxisScale;
  yScale: AxisScale;
  xAxisTitle?: string;
  yAxisTitle?: string;
  xAxisPlacement: AxisPlacement;
  xAxisTicks?: number;
  chartDimensions: Dimensions;
  margins: Margins;
  chartOffsetBottom?: number;
  renderChartData: () => JSX.Element;
  xAxisExtraProps?: Partial<AxisProps>;
  yAxisExtraProps?: Partial<AxisProps>;
}
