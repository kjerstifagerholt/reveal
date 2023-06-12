import { useSDK } from '@cognite/sdk-provider';
import { ExternalId, ExternalLabelDefinition } from '@cognite/sdk';
import { Toast } from 'apps/cdf-document-search/src/components/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createLabel,
  deleteLabels,
} from 'apps/cdf-document-search/src/services/api';
import { LABELS_KEYS } from 'apps/cdf-document-search/src/services/constants';
import { FilesApiError } from 'apps/cdf-document-search/src/services/types';

export const useLabelsCreateMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (label: ExternalLabelDefinition) => createLabel(sdk, label),
    {
      onSuccess: (_data, label) => {
        queryClient.invalidateQueries(LABELS_KEYS.labels());
        Toast.success({
          title: 'Label created',
          message: `A new label "${label.name}" (external id: ${label.externalId}) was created`,
        });
      },
      onError: ({ errors }: FilesApiError) => {
        errors.forEach((error) => {
          Toast.error({
            title: `Failed while creating a label`,
            status: error?.status || 400,
            message: error?.message,
          });
        });
      },
    }
  );
};

export const useLabelsDeleteMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation((ids: ExternalId[]) => deleteLabels(sdk, ids), {
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries(LABELS_KEYS.labels());
      Toast.success({
        title: 'Labels removed',
        message: `${ids.length} labels were removed`,
      });
    },
    onError: ({ errors }: FilesApiError) => {
      errors.forEach((error) => {
        Toast.error({
          title: `Failed while creating a label`,
          status: error?.status || 400,
          message: error?.message,
        });
      });
    },
  });
};
