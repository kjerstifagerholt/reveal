import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import { useSDK } from '@cognite/sdk-provider';

import {
  AssetConfigType,
  InternalAssetFilters,
} from '@data-exploration-lib/core';

import { queryKeys } from '../../../queryKeys';
import { TableSortBy } from '../../../types';
import {
  InternalAssetTreeData,
  useAssetsSearchResultWithLabelsQuery,
} from '../../internal';
import { buildTree } from '../utils/buildTree';
import { concatParents } from '../utils/concatParents';

export const useSearchAssetTree = (
  {
    query,
    assetFilter,
    sortBy,
  }: {
    query?: string;
    assetFilter: InternalAssetFilters;
    sortBy: TableSortBy[];
  },
  searchConfig?: AssetConfigType
) => {
  const sdkClient = useSDK();
  const { data, ...rest } = useAssetsSearchResultWithLabelsQuery(
    {
      query,
      assetFilter,
      sortBy: sortBy,
    },
    undefined,
    searchConfig
  );

  // get all parent ids from path aggregates
  const parentIds = useMemo(() => {
    return data.reduce((previousValue, currentValue) => {
      const pathIds =
        currentValue.aggregates?.path?.reduce((ids, path) => {
          if ('id' in path && currentValue.id !== path.id) {
            return [...ids, path.id];
          }

          return ids;
        }, [] as number[]) || [];

      return Array.from(new Set([...previousValue, ...pathIds]));
    }, [] as number[]);
  }, [data]);

  const { data: parentAssets, refetch } = useQuery<
    Record<string, InternalAssetTreeData>
  >(
    [queryKeys.assets(), 'parent-assets'],
    () => {
      return sdkClient.assets
        .retrieve(
          parentIds.map((id) => ({ id })),
          { aggregatedProperties: ['childCount'] }
        )
        .then((response) => {
          return keyBy(response, 'id');
        });
    },
    { enabled: !!parentIds.length }
  );

  useEffect(() => {
    // We use the 'refetch' function to get the data when new parentIds arrive instead of updating the query key
    // this way the table doesn't jump
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentIds]);

  return useMemo(() => {
    if (parentAssets !== undefined) {
      const tree = data.reduce((previousValue, currentValue) => {
        return [...previousValue, buildTree(currentValue, parentAssets)];
      }, [] as InternalAssetTreeData[]);

      const concattedParentsTree = concatParents(tree);

      const flaggedTreeForMore = isEmpty(concattedParentsTree)
        ? ([] as InternalAssetTreeData[])
        : [setIsLastFetched(concattedParentsTree[0])];

      return { data: flaggedTreeForMore, ...rest };
    }

    return { data, ...rest };
  }, [parentAssets, data, rest]);
};

// Compare childCount and children.length for each asset in the tree,
// if not equal set shouldShowMoreAssetsRow flag true to the last child in the children array.
const setIsLastFetched = (
  rootAsset: InternalAssetTreeData
): InternalAssetTreeData => {
  const aggregateChildCount = rootAsset?.aggregates?.childCount || 0;
  let childrenArr = rootAsset?.children || [];
  if (aggregateChildCount > childrenArr.length) {
    childrenArr = childrenArr.map((asset, index, arr) => {
      return {
        ...asset,
        // Flag for last fetched child of an asset's parent in hierarchy view.
        // Means that parent still have some children that are not fetched to be shown in the table.
        shouldShowMoreAssetsRow: index === arr.length - 1,
      };
    });
  }

  return {
    ...rootAsset,
    children: [...childrenArr.map((asset) => setIsLastFetched(asset))],
  };
};
