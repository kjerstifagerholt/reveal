import * as React from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import { discoverAPI, useJsonHeaders } from 'services/service';

import { ProjectConfig } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { showErrorMessage } from 'components/toast/Toast';
import {
  PROJECT_CONFIG_QUERY_KEY,
  LAYERS_QUERY_KEY,
} from 'constants/react-query';
import { Metadata } from 'pages/authorized/admin/projectConfig/types';

import { LOGIN_ERROR, THRESHOLD } from './constants';

export function useProjectConfigUpdateMutate({
  onSuccess = noop,
  onError = noop,
}: {
  onSuccess: () => void;
  onError: () => void;
}) {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [project] = getTenantInfo();

  return useMutation(
    (newProjectConfig: ProjectConfig) => {
      return discoverAPI.projectConfig.update(
        newProjectConfig,
        headers,
        project
      );
    },

    {
      onSuccess: (_config, data) => {
        const existing = queryClient.getQueryData(
          PROJECT_CONFIG_QUERY_KEY.CONFIG
        );
        if (isObject(existing)) {
          queryClient.setQueryData(PROJECT_CONFIG_QUERY_KEY.CONFIG, {
            ...existing,
            ...data,
          });
        }
        queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
        queryClient.invalidateQueries(LAYERS_QUERY_KEY.ALL); // reset the layers
        onSuccess();
      },
      onError: (_error) => {
        onError();
      },
    }
  );
}

export function useProjectConfigGetQuery(): UseQueryResult<ProjectConfig> {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.CONFIG,
    () => discoverAPI.projectConfig.getConfig(headers, project),
    {
      enabled: Boolean(project),
      retry: (failureCount) => {
        if (failureCount <= THRESHOLD) return true;

        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 2500);

        showErrorMessage(LOGIN_ERROR);
        return false;
      },
    }
  );
}

export const useProjectConfigByKey = <K extends keyof ProjectConfig>(
  key: K
) => {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.CONFIG,
    () => discoverAPI.projectConfig.getConfig(headers, project),
    {
      enabled: Boolean(project),
      select: React.useCallback(
        (data) => {
          return data[key];
        },
        [key]
      ),
    }
  );
};

export function useProjectConfigMetadataGetQuery(): UseQueryResult<Metadata> {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.METADATA,
    () => discoverAPI.projectConfig.getMetadata(headers, project),
    {
      enabled: Boolean(project),
    }
  );
}

export function useProjectConfigDeleteQuery() {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      return discoverAPI.projectConfig.delete(headers, project);
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
      onError: (_error) => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
    }
  );
}
