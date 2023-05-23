import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useSearchQueryParams } from '../../../hooks/useParams';
import { useTypesDataModelQuery } from '../../dataModels/query/useTypesDataModelQuery';
import { FDMClient } from '../../FDMClient';

export const useSearchDataTypesQuery = () => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);
  const { space, dataModel, version } = useParams();

  const { data, isLoading } = useTypesDataModelQuery();

  const query = useSearchQueryParams();

  return useQuery(
    ['dataType', 'search', space, dataModel, version, query],
    async () => {
      if (!(space && dataModel && version)) {
        return Promise.resolve();
      }
      // return client.
      console.log('HERE');

      const result = await client.searchDataTypes(query, data, {
        space,
        dataModel,
        version,
      });

      return result;
    },
    {
      enabled: data !== undefined || !isLoading,
    }
  );
};
