import { useMemo } from 'react';

import { InternalEventsFilters } from '@data-exploration-lib/core';

import omit from 'lodash/omit';

import {
  EventProperty,
  mapFiltersToEventsAdvancedFilters,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  property: EventProperty;
  /**
   * If the property is different from what we input for transformer.
   * Example: source and sources
   * Better to fix this in future and remove this.
   */
  filterProperty?: string;
  searchQuery?: string;
  filter?: InternalEventsFilters;
  query?: string;
}

export const useEventsFilterOptions = ({
  property,
  filterProperty,
  searchQuery,
  filter = {},
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useEventsUniqueValuesByProperty({
    property,
    query,
  });

  const { data: dynamicData = [] } = useEventsUniqueValuesByProperty({
    property,
    advancedFilter: mapFiltersToEventsAdvancedFilters(
      omit(filter, filterProperty || property),
      searchQuery
    ),
    query,
  });

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(data, dynamicData);
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
