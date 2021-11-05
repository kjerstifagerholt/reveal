import { AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
};

export type LoginArgs = BaseArgs & {
  project: string;
  useClientSecret: boolean;
  clientId: string;
  clientSecret: string;
  tenant: string;
  cluster: string;
};

export interface ProjectConfig {
  loginStatus: LOGIN_STATUS;
  authToken: string;
  clientSecret: string;
  clientId: string;
  cluster: string;
  tenant: string;
  project: string;
  authType: AUTH_TYPE;
}
