import {
  LAST_CREATED_KEY_VALUE,
  LAST_UPDATED_KEY_VALUE,
} from 'dataLayers/documents/keys';
import { adaptLocalEpochToUTC } from 'utils/date/adaptLocalEpochToUTC';

import { getMockGeometry } from '__test-utils/fixtures/geometry';

import { getMockSearchQueryWithFacets } from '../../__tests__/utils';
import { getSearchQuery } from '../queryUtil';

describe('Test query builder', () => {
  describe('Test facet building', () => {
    it(`File type facet should transform to IN condition`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());
      expect(result.filter.type).toEqual({
        in: ['Image', 'PDF'],
      });
    });

    it(`Label`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());

      expect(result.filter.sourceFile).not.toBeNull();
      expect(result.filter.labels).toEqual({
        containsAny: [
          { externalId: 'COMPLETION_REPORT' },
          { externalId: 'COMPLETION_SCHEMATIC' },
        ],
      });
    });

    it(`created data`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());
      expect(result.filter.sourceFile?.[LAST_CREATED_KEY_VALUE]).toEqual({
        max: adaptLocalEpochToUTC(1623695400000),
        min: adaptLocalEpochToUTC(1622485800000),
      });
    });

    it(`updated time`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());

      expect(result.filter.sourceFile).not.toBeNull();
      expect(result.filter.sourceFile?.[LAST_UPDATED_KEY_VALUE]).toEqual({
        max: adaptLocalEpochToUTC(1623695400000),
        min: adaptLocalEpochToUTC(1622485800000),
      });
    });

    it(`source`, async () => {
      const result = getSearchQuery(getMockSearchQueryWithFacets());

      expect(result.filter.sourceFile).not.toBeNull();
      expect(result.filter.sourceFile?.source).toEqual({
        in: ['bp-blob', 'bp-edm-attachment'],
      });
    });

    it('geolocation with extraGeoJsonFilters', () => {
      const geoJson = getMockGeometry();
      const result = getSearchQuery(
        getMockSearchQueryWithFacets({
          extraGeoJsonFilters: [
            {
              label: 'Test',
              geoJson,
            },
          ],
        })
      );
      expect(result.filter.geoLocation).toEqual(
        expect.objectContaining({
          relation: 'intersects',
          shape: geoJson,
        })
      );
    });

    it('geolocation with geoFilter', () => {
      const geometry = getMockGeometry();
      const result = getSearchQuery(
        getMockSearchQueryWithFacets({
          geoFilter: [{ geometry }],
        })
      );
      expect(result.filter.geoLocation).toEqual(
        expect.objectContaining({
          relation: 'intersects',
          shape: geometry,
        })
      );
    });
  });
});
