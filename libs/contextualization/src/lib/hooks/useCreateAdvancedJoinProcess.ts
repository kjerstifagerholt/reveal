import { useQuery } from '@tanstack/react-query';

import { getUrlParameters } from '../utils';

// import { useSDK } from '@cognite/sdk-provider';
// import { getUrlParameters } from '../utils/getUrlParameters';

const currentDate = new Date().toISOString();

export const useCreateAdvancedJoinProcess = (enabled: boolean | undefined) => {
  // const sdk = useSDK();
  const { space, headerName, versionNumber, type } = getUrlParameters();
  const body = JSON.stringify({
    items: [
      {
        externalId: `advanced-join-process-${currentDate}`, //random uid?
        type: 'direct',
        space: space,
        viewExternalId: type,
        viewVersion: versionNumber,
        propertyName: headerName,
      },
    ],
  });

  return useQuery({
    queryKey: ['context', 'advancedjoins', 'create'],
    queryFn: async () => {
      const response = await fetch(
        // `https://localhost:8443/api/v1/projects/${sdk.project}/context/advancedjoins`,
        `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        }
      );

      return response.json();
    },
    enabled: enabled,
  });
};
