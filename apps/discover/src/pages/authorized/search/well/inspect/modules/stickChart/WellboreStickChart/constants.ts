import { DepthMeasurementUnit } from 'constants/units';

import { EventsColumnView } from '../../common/Events/types';
import { ChartColumn } from '../types';

export const RKB_LEVEL_LABEL = 'RKB level';
export const WATER_DEPTH_LABEL = 'Water depth';

export const LOADING_TEXT = 'Loading';
export const EMPTY_SUMMARY_TEXT = 'No summary to display';
export const DEFAULT_EXPAND_GRAPH_TEXT = 'Expand to see graph';

export const NO_DATA_TEXT = 'Data not available';
export const INCOMPLETE_DATA_TEXT = 'Data incomplete';
export const NO_OPTIONS_SELECTED_TEXT = 'No options selected';
export const NO_DATA_AMONG_SELECTED_OPTIONS_TEXT =
  'No data among selected options';
export const NO_EVENT_HIGHLIGHTED_TEXT = 'No event highlighted';

export const NO_COLUMNS_SELECTED_TEXT = 'No columns selected';

export const SOME_EVENT_MISSING_TVD_TEXT =
  'Some event might be missing for TVD';

export const RKB_COLOR = 'var(--cogs-green-5)';
export const SEA_LEVEL_COLOR = 'var(--cogs-midblue-4)';
export const MUD_LINE_COLOR = '#000000';

export const DEPTH_SCALE_MIN_HEIGHT = 16;
export const DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT = 20;

export const DEPTH_SCALE_LABEL_WIDTH = 59;
export const DEPTH_SCALE_LABEL_HEIGHT = 17;

export const EVENTS_COLUMN_WIDTH = 120;
export const DEFAULT_CHART_WIDTH = 312;
export const CHART_COLUMN_WIDTH_COLLAPSED = 120;

export const DEFAULT_DEPTH_MEASUREMENT_TYPE = DepthMeasurementUnit.MD;
export const DEFAULT_EVENTS_COLUMN_VIEW = EventsColumnView.Cluster;

export const DEPTH_MEASUREMENT_TYPES = [
  DepthMeasurementUnit.MD,
  DepthMeasurementUnit.TVD,
];

export const DEFAULT_COLUMN_ORDER = [
  ChartColumn.FORMATION,
  ChartColumn.DEPTH,
  ChartColumn.CASINGS,
  ChartColumn.MEASUREMENTS,
  ChartColumn.NDS,
  ChartColumn.NPT,
  ChartColumn.TRAJECTORY,
  ChartColumn.SUMMARY,
];

export const DEFAULT_VISIBLE_COLUMNS = DEFAULT_COLUMN_ORDER.filter(
  (column) => column !== ChartColumn.DEPTH
);

export const EVENT_TYPES = ['npt', 'nds'] as const;

export const HIGHLIGHTED_EVENTS_STORAGE_KEY = 'HIGHLIGHTED_EVENTS_STORAGE_KEY';
