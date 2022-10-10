import { ConvertedDistance } from 'utils/units/constants';

import {
  Distance,
  Npt,
  NptAggregate,
  NptAggregateRow,
} from '@cognite/sdk-wells';

export interface NptInternal extends Omit<Npt, 'measuredDepth'> {
  nptCode: string;
  nptCodeDetail: string;
  nptCodeColor: string;
  measuredDepth?: ConvertedDistance;
}

export type NptAggregatesInternal = Record<
  NptAggregate['wellboreMatchingId'],
  NptAggregate['items']
>;

export interface NptAggregateRowInternal
  extends Omit<NptAggregateRow, 'duration'> {
  wellboreMatchingId: string;
  nptCode: string;
  nptCodeDetail: string;
  nptCodeColor: string;
  /**
   * Duration (hours) of the NPT event..
   */
  duration?: number;
}

export interface NptCodeDefinitionType {
  [key: string]: string;
}

export interface NptCodeDetailsDefinitionType {
  [key: string]: string;
}

export interface NptView extends NptInternal {
  wellName: string;
  wellboreName: string;
}

export interface NptAggregateView
  extends Omit<NptAggregateRowInternal, 'count'> {
  wellName: string;
  wellboreName: string;
}

export type NptCodesSelection = Record<
  NptInternal['nptCode'],
  NptInternal['nptCodeDetail'][]
>;

export interface NptWithTvd extends Npt {
  trueVerticalDepth?: Distance;
}

export interface NptInternalWithTvd extends NptInternal {
  trueVerticalDepth?: ConvertedDistance;
}
