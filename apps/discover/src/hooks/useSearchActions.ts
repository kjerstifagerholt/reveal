import { QueryClient } from 'react-query';
import { batch } from 'react-redux';

import { SavedSearchContent } from 'services/savedSearches';
import { FetchHeaders } from 'utils/fetch';

import { useCommonSearch } from './useCommonSearch';

export const useSearchActions = () => {
  const doCommonSearch = useCommonSearch();

  const doCommonSearchBatched = (
    searchQuery: Partial<SavedSearchContent>,
    queryClient: QueryClient,
    headers?: FetchHeaders
  ) => batch(() => doCommonSearch(searchQuery, queryClient, headers));

  return { doCommonSearch: doCommonSearchBatched };
};
