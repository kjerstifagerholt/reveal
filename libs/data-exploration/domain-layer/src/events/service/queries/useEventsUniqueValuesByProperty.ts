import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  EventProperty,
  EventsProperties,
  getEventsUniqueValuesByProperty,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';

import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';

interface Props {
  property: EventProperty;
  query?: string;
  filter?: InternalEventsFilters | OldEventsFilters;
  advancedFilter?: AdvancedFilter<EventsProperties>;
  options?: UseQueryOptions;
}

export const useEventsUniqueValuesByProperty = ({
  property,
  query,
  filter,
  advancedFilter,
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsUniqueValues(property, query, filter, advancedFilter),
    () => {
      return getEventsUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    { ...(options as any) }
  );
};
