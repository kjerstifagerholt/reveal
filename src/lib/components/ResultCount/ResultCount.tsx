import React from 'react';
import {
  SdkResourceType,
  useSearch,
  useAggregate,
} from '@cognite/sdk-react-query-hooks';
import { formatNumber } from 'lib/utils/numbers';

type ResultProps = {
  api: 'list' | 'search';
  type: SdkResourceType;
  filter?: any;
  count?: number;
  query?: string;
  label?: string;
};

export function ResultCount({
  api,
  type,
  filter,
  query,
  count,
  label = 'results',
}: ResultProps) {
  const { data: search, isFetched: searchDone } = useSearch(
    type,
    query!,
    { limit: 1000 },
    {
      enabled: api === 'search' && query && query.length > 0 && !count,
    }
  );
  const { data: list, isFetched: listDone } = useAggregate(type, filter, {
    enabled: api === 'list' && !count,
  });

  if (count) {
    return (
      <>
        {formatNumber(count)} {label}
      </>
    );
  }

  switch (api) {
    case 'list': {
      if (listDone && Number.isFinite(list?.count)) {
        return (
          <>
            {formatNumber(list?.count!)} {label}
          </>
        );
      }
      return null;
    }
    case 'search': {
      if (searchDone && Number.isFinite(search?.length)) {
        return (
          <>
            {formatNumber(search?.length!)} {label}
          </>
        );
      }
      return null;
    }
  }
}
