import { Datum } from 'plotly.js';

export type LineChartProps = {
  data: Data | Data[];
  xAxis?: Axis;
  yAxis?: Axis;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  variant?: Variant;
  layout?: Layout;
  config?: Config;
  disableTooltip?: boolean;
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
};

export interface Data {
  x: ValueType[];
  y: ValueType[];
  name?: string;
  color?: string;
}

export interface Layout {
  showTitle?: boolean;
  showSubtitle?: boolean;
  showLegend?: boolean;
  legendPlacement?: HorizontalPlacement;
  showAxisNames?: boolean;
  showTicks?: boolean;
  showTickLabels?: boolean;
}

export interface Config {
  responsive?: boolean;
  scrollZoom?: AxisDirectionConfig;
  selectionZoom?: AxisDirectionConfig;
  pan?: AxisDirectionConfig;
}

export interface Axis {
  name?: string;
  tickCount?: number;
  tickDistance?: number;
}

export interface TooltipRendererProps {
  x: ValueType;
  y: ValueType;
  name: string;
  color: string;
}

export type ValueType = Datum;

export type Variant = 'small' | 'medium' | 'large';

export type HorizontalPlacement = 'left' | 'center' | 'right';

export type AxisRange = [number, number];

export type AxisDirection = 'x' | 'y' | 'x+y';

export interface KeyTriggeredAxisDirection {
  trigger: 'default' | 'Shift';
  direction: AxisDirection;
}

export type AxisDirectionConfig =
  | false
  | AxisDirection
  | [KeyTriggeredAxisDirection, ...KeyTriggeredAxisDirection[]];
