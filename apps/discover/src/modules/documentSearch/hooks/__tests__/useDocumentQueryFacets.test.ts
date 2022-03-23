import 'services/documents/__mocks/setupDocumentsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { DocumentCategoriesFacets } from 'services/documents/types';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { getMockDocumentCategoriesGetWithStatus } from '../../../../services/documents/__mocks/getMockDocumentCategoriesGet';
import { getMockDocumentSearch } from '../../__mocks/getMockDocumentSearch';
import { useDocumentQueryFacets } from '../useDocumentQueryFacets';

const mockServer = setupServer(
  getMockDocumentSearch(),
  getMockDocumentCategoriesGetWithStatus(),
  getMockConfigGet()
);

describe('useDocumentQueryFacets', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should be ok', async () => {
    const { result, waitFor } = renderHook(() => useDocumentQueryFacets(), {
      wrapper,
    });

    await waitFor(() => result.current.isLoading === false);

    expect(result.current.error).toEqual(null);

    const data = result.current.data as DocumentCategoriesFacets;

    expect(data.fileCategory[0]).toEqual(
      expect.objectContaining({ name: 'one', count: 0, id: 'fileCategory' })
    );

    expect(data.labels[0]).toEqual(
      expect.objectContaining({ name: 'one', count: 0, id: 'labels' })
    );

    expect(data.location[0]).toEqual(
      expect.objectContaining({ name: 'one', count: 0, id: 'location' })
    );

    expect(data.pageCount[0]).toEqual(
      expect.objectContaining({
        name: '1',
        key: '1',
        count: 10,
        selected: false,
      })
    );
  });
});
