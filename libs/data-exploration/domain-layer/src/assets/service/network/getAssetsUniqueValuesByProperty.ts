import { CogniteClient, UniqueValuesAggregateResponse } from '@cognite/sdk';

import { AssetProperty, AssetsAggregateFilters } from '../types';

import { getAssetsAggregate } from './getAssetsAggregate';

export const getAssetsUniqueValuesByProperty = (
  sdk: CogniteClient,
  property: AssetProperty,
  filters: AssetsAggregateFilters = {}
): Promise<UniqueValuesAggregateResponse[]> => {
  return getAssetsAggregate<UniqueValuesAggregateResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: [property],
      },
    ],
  }).then(({ items }) => items);
};
