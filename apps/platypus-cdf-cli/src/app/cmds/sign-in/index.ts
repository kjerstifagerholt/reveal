import { Arguments, Argv } from 'yargs';
import { LoginArgs } from '../../types';
import { AUTH_TYPE, SETTINGS } from '../../constants';
import { promiseWithTimeout } from '../../utils/general';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'signin [project]';
export const aliases = ['login'];
export const desc = 'Sign in to Cognite Data Fusion';
export const builder = (yargs: Argv<LoginArgs>) =>
  yargs
    .usage('$0 signin [project]')
    .example('$0 signin platypus', 'Sign in to platypus project')
    .version(false)
    .positional('project', {
      alias: 'p',
      type: 'string',
      description: 'CDF Project Name',
    })
    .option('client-id', {
      type: 'string',
      description: "AAD Application's Client ID",
    })
    .check(validateClientId)
    .option('client-secret', {
      type: 'string',
      description:
        "AAD Application's Client Secret generated by the user they have long expiry and are hence suitable for CI/CD",
    })
    .check(validateClientSecret)
    .option('api-key', {
      type: 'string',
      description: 'API Key for legacy login',
    })
    .check(validateApiKey)
    .coerce('api-key', (apiKey) => apiKey || process.env.API_KEY)
    .option('tenant', {
      type: 'string',
      description: 'Azure Active Directory Tenant URI or ID',
    })
    .option('cluster', {
      type: 'string',
      description: 'Cluster Name',
    })
    .check(validateClusterName)
    .option('device-code', {
      type: 'boolean',
      default: false,
      description:
        'In case of interactive login, show a QR code for sign in (Recommended method for machines without a web browser)',
    });

export const handler = async (arg: Arguments<LoginArgs>) => {
  const client = getCogniteSDKClient();
  await promiseWithTimeout(
    SETTINGS.TIMEOUT,
    // perform and validate for access to CDF by checking token
    async () => {
      switch (arg.authType) {
        case AUTH_TYPE.APIKEY: {
          await client.assets.list({ limit: 1 });
          break;
        }
        case AUTH_TYPE.DEVICE_CODE:
        case AUTH_TYPE.CLIENT_SECRET:
        case AUTH_TYPE.PKCE: {
          const info = (await client.get('/api/v1/token/inspect')).data;
          if (!info.projects.some((el) => el.projectUrlName === arg.project)) {
            throw new Error(
              `failed to authenticate against CDF project: ${arg.project}`
            );
          }
        }
      }
    },
    'Timeout while authenticating user, please make sure you have entered valid parameters like cluster, project etc.'
  );
  arg.logger.success('Sign in was successful!');
};

export const validateClusterName = ({
  cluster,
}: {
  cluster: string;
}): boolean | string => {
  if (!/^[a-zA-Z0-9-_]+$/.test(cluster)) {
    return 'Cluster name is invalid, make sure its just the name of the cluster; For example if its "api.cognitedata.com" just enter "api"';
  }
  return true;
};

export const validateClientSecret = ({
  clientSecret,
  authType,
}: {
  clientSecret?: string;
  authType: AUTH_TYPE;
}): boolean | string =>
  authType === AUTH_TYPE.CLIENT_SECRET && (!clientSecret || clientSecret === '')
    ? "client-secret can't be empty string"
    : true;

export const validateApiKey = ({
  apiKey,
  authType,
}: {
  apiKey: string;
  authType: AUTH_TYPE;
}): boolean | string =>
  authType === AUTH_TYPE.APIKEY && (!apiKey || apiKey === '')
    ? 'api-key must be provided for legacy auth'
    : true;

export const validateClientId = ({
  clientId,
  authType,
}: {
  clientId: string;
  authType: AUTH_TYPE;
}): boolean | string =>
  authType === AUTH_TYPE.CLIENT_SECRET && (!clientId || clientId === '')
    ? 'client-id must be provided for clientSecret auth'
    : true;
