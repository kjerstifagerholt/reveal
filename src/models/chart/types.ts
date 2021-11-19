import { Node, Connection } from '@cognite/connect';
import { FlowExportObject } from 'react-flow-renderer';

export type Chart = {
  version: number;
  id: string;
  name: string;
  user: string;
  userInfo?: UserInfo;
  // could be undefined for old charts
  createdAt: number;
  updatedAt: number;
  timeSeriesCollection?: ChartTimeSeries[];
  workflowCollection?: ChartWorkflow[];
  sourceCollection?: SourceCollectionData[];
  dateFrom: string;
  dateTo: string;
  public?: boolean;
  dirty?: boolean;
  settings?: ChartSettings;
};

export type SourceCollectionData = {
  type: string;
  id: string;
};

export type ChartSettings = {
  showYAxis?: boolean;
  showMinMax?: boolean;
  showGridlines?: boolean;
  mergeUnits?: boolean;
  autoAlign?: boolean;
};

export type ChartTimeSeries = {
  type?: string;
  id: string;
  name: string;
  color: string;
  tsId: number;
  tsExternalId?: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  displayMode?: 'lines' | 'markers';
  enabled: boolean;
  unit?: string;
  originalUnit?: string;
  preferredUnit?: string;
  description?: string;
  range?: number[];
  statisticsCalls?: StatisticsCallRef[];
  createdAt: number;
};

type ChartWorkflowBase = {
  type?: string;
  id: string;
  name: string;
  lineWeight?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  displayMode?: 'lines' | 'markers';
  unit?: string;
  preferredUnit?: string;
  color: string;
  enabled: boolean;
  range?: number[];
  calls?: CalculationCallRef[];
  statisticsCalls?: StatisticsCallRef[];
  createdAt?: number;
  attachTo?: string;
};

/**
 * Format used for @cognite/connect
 */
export type ChartWorkflowV1 = ChartWorkflowBase & {
  version: '' | undefined;
  nodes?: StorableNode[];
  connections?: Record<string, Connection>;
};

/**
 * Format used for react-flow
 */
export type ChartWorkflowV2 = ChartWorkflowBase & {
  version: 'v2';
  flow?: FlowExportObject;
};

export type ChartWorkflow = ChartWorkflowV1 | ChartWorkflowV2;

export type StorableNode = Omit<Node, 'functionEffect'> & {
  functionEffectReference?: string;
};

export type CalculationCallRef = {
  callId: string;
  callDate: number;
  hash?: number;
  computation?: string;
};

export type StatisticsCallRef = {
  callId: string;
  callDate: number;
  hash?: number;
};

export type UserInfo = {
  id: string;
  email?: string;
  displayName?: string;
};
