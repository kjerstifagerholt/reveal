import * as React from 'react';
import {
  EMPTY_OBJECT,
  InternalSequenceFilters,
  SequenceConfigType,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { useSequenceSearchResultQuery } from './useSequenceSearchResultQuery';

export const useSequenceSearchResultWithMatchingLabelsQuery = (
  {
    query,
    filter = EMPTY_OBJECT,
    sortBy,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions,
  searchConfig: SequenceConfigType = getSearchConfig().sequence
) => {
  const { data, ...rest } = useSequenceSearchResultQuery(
    { query, filter, sortBy },
    options,
    searchConfig
  );

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (searchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (searchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (searchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (searchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (searchConfig.metadata.enabled) {
      arr.push('metadata');
    }

    return arr;
  }, [searchConfig]);

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((sequence) => {
        return {
          ...sequence,
          matchingLabels: extractMatchingLabels(sequence, query, properties),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
