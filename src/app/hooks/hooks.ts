import React from 'react';
import qs from 'query-string';
import {
  useParams,
  useLocation,
  useNavigate,
  Location,
  NavigateFunction,
} from 'react-router-dom';
import { ResourceType } from '@cognite/data-exploration';
import { createLink } from '@cognite/cdf-utilities';
import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';

import { trackUsage } from 'app/utils/Metrics';
import { SEARCH_KEY } from '../utils/constants';
import { FILTER } from 'app/store/filter/constants';

const opts: { arrayFormat: 'comma' } = { arrayFormat: 'comma' };

// TODO: Refactor this whole file into separate files

const getSetItems =
  (
    key: string,
    push: boolean,
    location: Location,
    navigate: NavigateFunction
  ) =>
  (newItems: string | string[]) => {
    const search = qs.parse(location.search, opts);
    navigate(
      {
        pathname: location.pathname,
        search: qs.stringify(
          {
            ...search,
            [key]: Array.isArray(newItems)
              ? newItems
              : encodeURIComponent(newItems),
          },
          opts
        ),
      },
      { replace: !push }
    );
  };

export function useQueryString(
  key: string,
  push = true
): [string, (_: string) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const search = qs.parse(location.search, opts);
  const item = (search[key] || '') as string;

  const queryString = React.useMemo(() => decodeURIComponent(item), [item]);

  return [queryString, getSetItems(key, push, location, navigate)];
}

const emptyArray = [] as string[];
export function useQueryStringArray(
  key: string,
  push: boolean = true
): [string[], (_: any[]) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const search = qs.parse(location?.search, opts);
  const rawItems = search[key];
  if (!rawItems) {
    return [emptyArray, getSetItems(key, push, location, navigate)];
  }
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return [items, getSetItems(key, push, location, navigate)];
}

export const useCurrentResourceType = (): [
  ResourceType,
  (type: ResourceType) => void
] => {
  const navigate = useNavigate();
  const location = useLocation();

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();
  const setCurrentResourceType = React.useCallback(
    (newResourceType: ResourceType) => {
      const { [SEARCH_KEY]: query, [FILTER]: filter } = qs.parse(
        location.search,
        opts
      );

      navigate(
        createLink(
          `/explore/search/${newResourceType}`,
          {
            [SEARCH_KEY]: query,
            [FILTER]: filter,
          },
          opts
        )
      );
    },
    [location.search, navigate]
  );

  return [resourceType, setCurrentResourceType];
};

export const useCurrentResourceId = (): [
  number | undefined,
  (type: number | undefined, replace?: boolean) => void
] => {
  const [type] = useCurrentResourceType();
  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams<{
    id: string;
  }>();
  const idNumber =
    !!id && Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  const setCurrentResourceId = (
    newResourceId?: number,
    replaceHistory: boolean = false
  ) => {
    const search = qs.parse(location.search, opts);
    if (!newResourceId) {
      navigate(createLink(`/explore/search/${type}`, search, opts), {
        replace: replaceHistory,
      });
    } else {
      navigate(
        createLink(`/explore/search/${type}/${newResourceId}`, search, opts),
        { replace: replaceHistory }
      );
    }
  };
  return [idNumber, setCurrentResourceId];
};

export const useUserInformation = () => {
  return useQuery('user-info', getUserInformation);
};

/**
 * Create the function which helps to persist the search string and create the relative link in the navigation in preview mode
 * @param tabType the type of the tab
 * @param type Resource type of the navigator
 */
export const useOnPreviewTabChange = (tabType?: string, type?: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (newTab: string) => {
    navigate(
      createLink(
        `/${location.pathname
          .split('/')
          .slice(2, tabType ? -1 : undefined)
          .join('/')}/${newTab}`,
        qs.parse(location.search)
      ),
      { replace: true }
    );
    trackUsage('Exploration.Details.TabChange', {
      type,
      tab: newTab,
    });
  };
};
