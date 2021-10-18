import {
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { fetchGet, FetchHeaders, fetchPatch } from '_helpers/fetch';
import { SIDECAR } from 'constants/app';

const getUserManagementEndpoint = (action: string) =>
  `${SIDECAR.userManagementServiceBaseUrl}/user/${action}`;

export const userPreferences = (headers: FetchHeaders) => {
  const get = () =>
    fetchGet<UMSUserProfile>(getUserManagementEndpoint('me'), {
      headers,
    });

  const update = (payload: Partial<UMSUserProfilePreferences>) =>
    fetchPatch<UMSUserProfile>(getUserManagementEndpoint('me'), payload, {
      headers,
    });

  return {
    get,
    update,
  };
};
