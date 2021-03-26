import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { Group } from '@cognite/sdk';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import { setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';
import { getMetrics } from 'utils/metrics';
import * as actions from './actions';

export const fetchUserGroups = (apiClient: ApiClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadGroups());
  try {
    const groups: Group[] = await apiClient.getUserGroups(false);
    dispatch(actions.loadedGroups(groups));
    const isAdmin = checkIsAdmin(groups);
    Sentry.addBreadcrumb({
      category: 'auth',
      message: `Is admin user: ${isAdmin}`,
      level: Sentry.Severity.Info,
    });
    getMetrics().people({ isAdmin });
  } catch (e) {
    if (e?.code !== 403) {
      dispatch(actions.loadGroupsError(e));
      dispatch(setHttpError('Failed to fetch user groups', e));
      Sentry.captureException(e);
    }
  }
};

export const getGroupNames = (groups: Group[] = []): string[] =>
  groups.map((group) => group.name);

export const checkIsAdmin = (groups: Group[]): boolean =>
  getGroupNames(groups).includes(ADMIN_GROUP_NAME);
