import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import {
  Integration,
  IntegrationFieldValue,
  RegisterIntegrationInfo,
} from 'model/Integration';
import { IntegrationAPIResponse } from 'model/IntegrationAPIResponse';
import { get, getBaseUrl } from 'utils/baseURL';

export const getIntegrations = async (
  project: string
): Promise<Integration[]> => {
  const response = await get<IntegrationAPIResponse>('/', project);
  return response.data.items;
};

export const getIntegrationById = async (
  integrationId: number,
  project: string
): Promise<Integration> => {
  const response = await get<Integration>(`/${integrationId}`, project);
  return response.data;
};

type Update = {
  [key: string]: {
    set: IntegrationFieldValue;
  };
};

export interface IntegrationUpdateSpec {
  id: string;
  update: Update;
}

export const saveUpdate = async (
  project: string,
  items: IntegrationUpdateSpec[]
) => {
  const response = await sdkv3.post<IntegrationAPIResponse>(
    `${getBaseUrl(project)}/update`,
    {
      data: {
        items,
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const registerIntegration = async (
  project: string,
  integration: Partial<RegisterIntegrationInfo>
) => {
  const response = await sdkv3.post<IntegrationAPIResponse>(
    `${getBaseUrl(project)}`,
    {
      data: {
        items: [integration],
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};
