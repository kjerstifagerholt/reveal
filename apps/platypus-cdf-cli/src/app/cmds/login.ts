import { Arguments, Argv } from 'yargs';
import { BaseArgs, LoginArgs } from '../types';
import { AUTH_TYPE } from '../constants';

export const command = 'login [project]';
export const desc = 'Login to CDF for using Platypus';
export const builder = (yargs: Argv<LoginArgs>) =>
  yargs
    .usage('$0 login [project]')
    .example('platypus login cognite', 'Login to cognite tenant')
    .positional('project', {
      alias: 'p',
      type: 'string',
      description: 'CDF Project Name',
      default: 'platypus',
    })
    .option('client-id', {
      type: 'string',
      default: '4770c0f1-7bb6-43b5-8c37-94f2a9306757', //todo: read from app config
      description: "AAD Application's Client ID",
    })
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
      default: 'cogniteappdev.onmicrosoft.com',
      description: 'Azure Active Directory Tenant URI or ID',
    })
    .option('cluster', {
      type: 'string',
      default: 'greenfield',
      description: 'Cluster Name',
    })
    .check(validateClusterName)
    .option('auth-type', {
      type: 'string',
      default: AUTH_TYPE.CLIENT_SECRET,
      description: 'Auth type',
    })
    .choices('auth-type', [AUTH_TYPE.CLIENT_SECRET, AUTH_TYPE.LEGACY]);

export const handler = async (arg: Arguments<BaseArgs>) => {
  arg.logger.info('Login Success');
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
  clientSecret: string;
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
  authType === AUTH_TYPE.LEGACY && (!apiKey || apiKey === '')
    ? 'api-key must be provided for legacy auth'
    : true;
