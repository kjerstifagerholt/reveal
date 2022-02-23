import { filters } from 'dataLayers/wells/filters';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getNPTDetailFilter = (
  value?: unknown
): Pick<WellFilter, 'npt'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isArray(value)) {
    return {
      npt: {
        exists: true,
        nptCodeDetails: filters.toContainsAll(value),
      },
    };
  }

  return {};
};
