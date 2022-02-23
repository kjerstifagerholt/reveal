import { filters } from 'dataLayers/wells/filters';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getNDSProbabilityFilter = (
  value?: unknown
): Pick<WellFilter, 'nds'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isArray(value)) {
    return {
      nds: {
        exists: true,
        probabilities: filters.toContainsAny(value),
      },
    };
  }

  return {};
};
