import isEmpty from 'lodash/isEmpty';

import { SequenceFilter } from '@cognite/sdk/dist/src';

import { InternalSequenceFilters } from '@data-exploration-lib/core';

export const mapInternalFilterToSequenceFilter = ({
  assetSubtreeIds,
}: InternalSequenceFilters): Required<SequenceFilter>['filter'] | undefined => {
  let filters: Required<SequenceFilter>['filter'] = {};

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
