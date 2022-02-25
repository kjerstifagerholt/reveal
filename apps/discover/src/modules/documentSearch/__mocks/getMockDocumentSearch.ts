import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DocumentsAggregatesResponse } from '@cognite/sdk-playground';

import { getDocumentFixture } from '__test-utils/fixtures/documents/getDocumentFixture';
import { MSWRequest } from '__test-utils/types';
import { DocumentApiResponseItems } from 'modules/documentSearch/types';

import { getMockAPIResponse } from '../../../__test-utils/fixtures/document';
import { SIDECAR } from '../../../constants/app';

export const getMockDocumentSearch = (
  customResponse?: DocumentsAggregatesResponse<DocumentApiResponseItems>
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/documents/search`;

  // console.log('STARTING MOCK', url);

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.json(
        customResponse || getMockAPIResponse([{ item: getDocumentFixture() }])
      )
    );
  });
};
