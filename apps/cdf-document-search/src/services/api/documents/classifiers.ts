import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient, ListResponse } from '@cognite/sdk';
import {
  DocumentsClassifierCreate,
  DocumentsClassifier as Classifier,
  DocumentsClassifierListByIds,
  DocumentsClassifierListByIdsRequest,
} from '@cognite/sdk-playground';

export const createDocumentClassifier = (
  sdk: CogniteClient,
  create: DocumentsClassifierCreate
) => {
  const project = getProject();
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${project}/documents/classifiers`,
      {
        data: {
          items: [create],
        },
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentClassifiers = (
  sdk: CogniteClient,
  cursor?: string
) => {
  const project = getProject();
  let url = `/api/playground/projects/${project}/documents/classifiers`;
  if (cursor !== undefined) {
    url += `?cursor=${cursor}`;
  }

  return sdk
    .get<ListResponse<Classifier[]>>(url)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentClassifierById = (sdk: CogniteClient, id: number) => {
  return fetchDocumentClassifierByIds(sdk, [{ id }]);
};

export const fetchDocumentClassifierByIds = (
  sdk: CogniteClient,
  ids: DocumentsClassifierListByIds[]
) => {
  const project = getProject();
  const request: DocumentsClassifierListByIdsRequest = {
    items: ids,
  };
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${project}/documents/classifiers/byids`,
      {
        data: request,
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    })
    .catch((error) => {
      throw error;
    });
};

export const deleteDocumentClassifier = (sdk: CogniteClient, id: number) => {
  const project = getProject();
  return sdk
    .post(`/api/playground/projects/${project}/documents/classifiers/delete`, {
      data: {
        items: [{ id }],
      },
    })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      throw error;
    });
};
