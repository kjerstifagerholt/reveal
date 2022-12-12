import { useInfiniteList } from '@cognite/sdk-react-query-hooks';
import { mergeDataSetResponsePages } from '../transformers/mergeDataSetResponsePages';
import { DataSetInternal } from '../types';
import { DATA_SET_LIMIT } from '../../service/constants';

export const useDataSetQuery = () => {
  const result = useInfiniteList<DataSetInternal>('datasets', DATA_SET_LIMIT);

  if (result.hasNextPage && !result.isFetching) {
    result.fetchNextPage();
  }

  const data = mergeDataSetResponsePages(result.data);

  return {
    ...result,
    data,
  };
};
