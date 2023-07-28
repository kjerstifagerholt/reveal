import React, { useEffect, useState } from 'react';

import { AuthProvider, useAuth } from '@cognite/auth-react';
import sdk, {
  createSdkClient,
  loginAndAuthIfNeeded,
} from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
// import { CogniteClient } from '@cognite/sdk';

export interface AuthProxyProviderProps {
  children: React.ReactNode;
}

export const AuthProxyProvider = ({ children }: AuthProxyProviderProps) => {
  const { getToken, getUser, logout, project, cluster, idpType } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  // When loading initially, the sdk is going to be null
  // create one using the getToken function and cluster from above
  useEffect(() => {
    if (!authenticated) {
      const tokenProvider = {
        getAppId: () => 'apps.cognite.com/cdf',
        getToken,
        getUserInformation: () => {
          return getUser().then((user) => ({
            id: user.id!,
            mail: user.email,
            displayName: user.name,
          }));
        },
        getFlow: () => ({ flow: idpType }),
        logout,
      };
      const sdkClient = createSdkClient(
        {
          appId: tokenProvider.getAppId(),
          getToken,
          baseUrl: `https://${cluster}`,
          project,
        },
        tokenProvider
      );

      // const sdkClient: CogniteClient = new CogniteClient({
      //   appId: 'apps.cognite.com/cdf',
      //   project: 'platypus',
      //   noAuthMode: true,
      //   baseUrl: window.location.origin,
      //   getToken: async () => 'mock',
      // });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sdkClient.initAPIs();

      // eslint-disable-next-line
      // @ts-ignore
      sdk.overrideInstance(sdkClient);
      setAuthenticated(true);
    }
  }, [authenticated, getToken, project, cluster, logout, getUser, idpType]);

  if (!authenticated) {
    return <Loader infoText="Loading" />;
  }

  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      {children}
    </AuthWrapper>
  );
};

export interface FusionAuthContainerProps {
  children: React.ReactNode;
}
export const AuthContainer = ({ children }: FusionAuthContainerProps) => {
  if (isUsingUnifiedSignin()) {
    return (
      <AuthProvider loader={<Loader infoText="Loading" />}>
        <AuthProxyProvider>{children}</AuthProxyProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      {children}
    </AuthWrapper>
  );
};
