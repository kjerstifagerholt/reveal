import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { WellLog } from '../../types';
import { Domain } from '../Log/interfaces';

export type DomainListItem = {
  columnExternalId: string;
  min: number;
  max: number;
};

export type DomainMap = Record<string, Domain>;
export type DomainChangeCallback = (
  columnExternalId: string,
  domainType: 'min' | 'max',
  value: number
) => void;

export interface DomainFilterProps {
  domainList: DomainListItem[];
  onChangeDomain: DomainChangeCallback;
}

export interface DomainFilterRowProps {
  domainListItem: DomainListItem;
  onChangeDomain: DomainChangeCallback;
}

export interface LogViewerProps {
  wellLog: WellLog;
  wellLogRowData: DepthMeasurementData;
  events: CogniteEventV3ish[];
  domainMap: DomainMap;
  setDomainList: (domainList: DomainListItem[]) => void;
}
