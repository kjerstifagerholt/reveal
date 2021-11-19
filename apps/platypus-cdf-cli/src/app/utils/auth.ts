import { getAccessTokenForClientSecret } from '../common/auth';
import { AUTH_TYPE, CONFIG_KEY, LOGIN_STATUS } from '../constants';
import { ProjectConfig } from '../types';
import { setProjectConfigItem } from './config';

export const getAuthToken = (arg: ProjectConfig) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;
  const scopes = [`${baseUrl}/.default`];

  if (arg.authType === AUTH_TYPE.LEGACY) {
    return arg.apiKey;
  }

  if (arg.authType === AUTH_TYPE.CLIENT_SECRET) {
    const token = (
      await getAccessTokenForClientSecret({
        authority,
        clientId,
        clientSecret: arg.clientSecret,
        scopes,
      })
    ).accessToken;

    if (token) {
      setProjectConfigItem(CONFIG_KEY.AUTH_TYPE, arg.authType);
      setProjectConfigItem(CONFIG_KEY.AUTH_TOKEN, token);
      setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.SUCCESS);
      return token;
    } else {
      setProjectConfigItem(
        CONFIG_KEY.LOGIN_STATUS,
        LOGIN_STATUS.UNAUTHENTICATED
      );
      throw new Error(
        'Unable to refresh token based on your login, you need to retrigger login once again, try $ platypus login'
      );
    }
  }
  throw new Error(
    'Failed to log you in, make sure you are using correct auth type and correct credentials/config'
  );
};
