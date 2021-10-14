import get from 'lodash/get';

import { shortDate } from '_helpers/date';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

import { processAccessor } from './utils';

export const getCommonColumns = (unit: string) => {
  return [
    {
      id: accessors.START_TIME,
      Header: 'Start Date',
      accessor: (row: NPTEvent) => {
        const startDate = processAccessor(row, accessors.START_TIME);
        if (startDate) return shortDate(startDate);
        return null;
      },
    },
    {
      id: accessors.END_TIME,
      Header: 'End Date',
      accessor: (row: NPTEvent) => {
        const endDate = processAccessor(row, accessors.END_TIME);
        if (endDate) return shortDate(endDate);
        return null;
      },
    },
    {
      id: accessors.MEASURED_DEPTH,
      Header: `NPT MD (${unit})`,
      accessor: (row: NPTEvent) => {
        const depth = get(row, accessors.MEASURED_DEPTH);
        if (depth) return depth.toFixed(0);
        return null;
      },
    },
    {
      id: accessors.DURATION,
      Header: 'Duration (Hrs)',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.DURATION),
    },
    {
      id: accessors.NPT_DETAIL_CODE,
      Header: 'NPT Detail Code',
      accessor: (row: NPTEvent) =>
        processAccessor(row, accessors.NPT_DETAIL_CODE),
    },
    {
      id: accessors.DESCRIPTION,
      Header: 'Description',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.DESCRIPTION),
    },
    {
      id: accessors.ROOT_CAUSE,
      Header: 'Root Cause',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.ROOT_CAUSE),
    },
    {
      id: accessors.LOCATION,
      Header: 'Failure Location',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.LOCATION),
    },
    {
      id: accessors.NPT_LEVEL,
      Header: 'NPT Level',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.NPT_LEVEL),
    },
    {
      id: accessors.SUBTYPE,
      Header: 'Subtype',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.SUBTYPE),
    },
  ];
};
