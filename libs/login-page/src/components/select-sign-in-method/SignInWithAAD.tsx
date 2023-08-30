import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';

import {
  getSelectedIdpDetails,
  saveSelectedIdpDetails,
  usePca,
  AADResponse,
  loginRedirectAad,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import { Microsoft } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';
import { useLoginPageContext } from '../../contexts/LoginPageContext';
import { SSO_SESSION_KEY } from '../../utils';

interface Props extends AADResponse {
  trySSO?: boolean;
}

const SignInWithAAD = ({
  appConfiguration,
  authority,
  internalId,
  label,
  type,
  trySSO = false,
  clusters,
}: Props): JSX.Element => {
  const { isHandledAADRedirect, setIsHandledAADRedirect } =
    useLoginPageContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pca = usePca(appConfiguration.clientId, authority);

  const { internalId: selectedInternalId, idpId } =
    getSelectedIdpDetails() ?? {};
  const shouldHandleRedirect = internalId === selectedInternalId;

  // Keep track of sso attempts to avoid doing a sso signing when the user clicks "Sign in to
  // another project or account"
  const ssoDoneThisSession = !!window.sessionStorage.getItem(SSO_SESSION_KEY);

  const persistIDPDetails = useCallback(
    (tenantId: string) => {
      saveSelectedIdpDetails({
        internalId,
        type,
        idpId: `${internalId}_${tenantId}`,
      });
    },
    [internalId, type]
  );

  const {
    data: ssoResult,
    isInitialLoading: ssoLoading,
    isSuccess: ssoSuccess,
  } = useQuery(
    ['login', 'sso', internalId],
    () =>
      Promise.any(
        clusters.map((c) => {
          const scopes = [
            `https://${c}/IDENTITY`,
            `https://${c}/user_impersonation`,
          ];
          return pca?.ssoSilent({ scopes });
        })
      ),
    {
      enabled: pca && trySSO && !ssoDoneThisSession,
    }
  );

  useEffect(() => {
    if (ssoSuccess && ssoResult && !ssoDoneThisSession) {
      window.sessionStorage.setItem(SSO_SESSION_KEY, 'yes');
      pca?.setActiveAccount(ssoResult.account);
      persistIDPDetails(ssoResult.tenantId);
      navigate('/select-project');
    }
  }, [
    ssoResult,
    navigate,
    internalId,
    ssoSuccess,
    pca,
    type,
    persistIDPDetails,
    ssoDoneThisSession,
  ]);

  useEffect(() => {
    // If there is an entry for selected idp, this means user has already
    // started an authentication flow. It could be succeeded, it could be
    // failed or user might have aborted the authentication flow in the middle.
    // Here, we handle these three cases for client ids added to current
    // domain configuration.
    if (shouldHandleRedirect) {
      pca
        ?.handleRedirectPromise()
        .then((redirectResult) => {
          if (redirectResult?.account) {
            persistIDPDetails(redirectResult.tenantId);
            pca.setActiveAccount(redirectResult?.account);
            navigate('/select-project');
          }
        })
        // eslint-disable-next-line lodash/prefer-noop
        .catch(() => {
          // TODO: handle error case with `error.errorCode`
        })
        .finally(() => {
          setIsHandledAADRedirect(true);
        });
    }
  }, [
    navigate,
    pca,
    persistIDPDetails,
    setIsHandledAADRedirect,
    shouldHandleRedirect,
  ]);

  useEffect(() => {
    // If there is an active AAD account entry in local storage for the
    // selected login flow, we redirect to `/select-project` route.
    const activeAccount = pca?.getActiveAccount();

    if (
      selectedInternalId === internalId &&
      `${internalId}_${activeAccount?.tenantId}` === idpId
    ) {
      navigate('/select-project');
    }
  }, [authority, navigate, idpId, internalId, pca, selectedInternalId]);

  const handleSignInWithAAD = () => {
    // In some cases, we still have `msal.interaction.status` entry on
    // session storage while trying to sign in. And it returns an error if we
    // call `loginRedirect` without calling `handleRedirectPromise`. We don't
    // care about redirect promise result because it should be handled in some
    // other place. We only want to clear everything related to msal state.
    pca?.handleRedirectPromise().then(() => {
      // Resetting the active aad account if there is any
      pca?.setActiveAccount(null);

      // Saving selected login flow id to local storage so that sdk singleton can
      // use it for authentication.
      saveSelectedIdpDetails({ internalId, type });

      // Redirecting to microsoft login page
      loginRedirectAad(pca, [], 'select_account');
    });
  };

  return (
    <SignInButton
      isLoading={!isHandledAADRedirect || ssoLoading}
      onClick={handleSignInWithAAD}
      icon={<Microsoft />}
    >
      {label || t('sign-in-with-microsoft')}
    </SignInButton>
  );
};

export default SignInWithAAD;
