import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataValuesAggregate } from '../network/getDocumentsMetadataValuesAggregate';

export const useDocumentsMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadataValues(String(metadataKey)),
    () => {
      return getDocumentsMetadataValuesAggregate(sdk, String(metadataKey));
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
