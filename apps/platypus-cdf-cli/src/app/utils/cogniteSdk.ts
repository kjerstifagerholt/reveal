import { CogniteClient as CogniteClientV6 } from '@cognite/sdk-v6';
import { CogniteClient } from '@cognite/sdk';
import { ProjectConfig } from '../types';
import { getAuthToken } from './auth';
import { AUTH_TYPE } from '../constants';

let client: CogniteClientV6;

export const getCogniteSDKClient = () => client as unknown as CogniteClient;

export const setCogniteSDKClient = (
  newClient: CogniteClientV6 | CogniteClient
) => {
  client = newClient as unknown as CogniteClientV6;
};

export const createSdkClient = (authArgs: ProjectConfig) => {
  const { cluster, authType, project } = authArgs;
  const baseUrl = `https://${cluster}.cognitedata.com`;
  const appId = 'Platypus';

  const client = new CogniteClientV6({
    appId,
    project,
    baseUrl: authType === AUTH_TYPE.LEGACY ? '' : baseUrl,
    apiKeyMode: authType === AUTH_TYPE.LEGACY,
    getToken: getAuthToken(authArgs),
  });

  setCogniteSDKClient(client);

  return client as unknown as CogniteClient;
};
