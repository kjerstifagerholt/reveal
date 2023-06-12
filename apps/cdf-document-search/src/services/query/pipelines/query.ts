import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { PIPELINES_KEYS } from 'apps/cdf-document-search/src/services/constants';
import { fetchDocumentPipelines } from 'apps/cdf-document-search/src/services/api';

export const useDocumentsPipelinesQuery = () => {
  const sdk = useSDK();

  return useQuery(PIPELINES_KEYS.pipelines(), () =>
    fetchDocumentPipelines(sdk)
  );
};
