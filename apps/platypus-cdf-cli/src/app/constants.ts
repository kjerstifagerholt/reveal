export enum AUTH_TYPE {
  PKCE = 'interactive',
  CLIENT_SECRET = 'clientSecret',
  APIKEY = 'legacy',
  DEVICE_CODE = 'deviceCode',
}

export enum LOGIN_STATUS {
  SUCCESS = 'success',
  UNAUTHENTICATED = 'unauthenticated',
}

export enum ROOT_CONFIG_KEY {
  AUTH = 'auth',
  TELEMETRY_DISABLED = 'telemetryDisabled',
  AUTO_CHECK_FOR_UPDATES = 'autoCheckForUpdates',
  UID = 'uid',
}

export enum AUTH_CONFIG {
  MSAL_AUTH_CACHE = 'msalTokenCache',
  ACCOUNT_INFO = 'msalAccountInfo',
  AUTH_TYPE = 'authType',
  LOGIN_STATUS = 'loginStatus',
  CLIENT_ID = 'clientId',
  CLIENT_SECRET = 'clientSecret',
  TENANT = 'tenant',
  CLUSTER = 'cluster',
  PROJECT = 'project',
  API_KEY = 'apiKey',
}

export const CONSTANTS = {
  APP_ID: 'cdf',
  PROJECT_CONFIG_FILE_NAME: 'cdfrc.json',
  PROJECT_CONFIG_DEFAULT_SCHEMA_FILE_NAME: 'schema.graphql',
  MANUAL_WEBSITE: 'https://github.com/cognitedata/platypus',
  GRAPHQL_CODEGEN_PLUGINS_NAME: {
    JS_SDK: 'js-sdk',
  },
};

export const SupportedGraphQLGeneratorPlugins = [
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.JS_SDK,
];

export const SETTINGS = {
  TIMEOUT: 10 * 1000,
};
