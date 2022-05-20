import { FeatureCollection } from 'geojson';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { adaptGeoJSONToGeospatial } from './adaptGeoJSONToGeospatial';
import { adaptGeospatialToGeoJSON } from './adaptGeospatialToGeoJSON';
import {
  DISCOVER_FEATURE_TYPE_PREFIX,
  FEATURE_ERROR,
  FEATURE_TYPE_ERROR,
} from './constants';

export const geospatial = {
  createLayer: (
    featureCollection: FeatureCollection,
    featureTypeId: string
  ) => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      featureCollection,
      featureTypeId
    );

    return getCogniteSDKClient()
      .geospatial.featureType.create([featureType])
      .catch((error) => {
        log(error?.message);
        throw new Error(FEATURE_TYPE_ERROR);
      })
      .then(([featureTypeResponse]) => {
        return getCogniteSDKClient()
          .geospatial.feature.create(
            featureTypeResponse.externalId,
            featureItems
          )
          .catch((error) => {
            geospatial.deleteFeatureType(featureTypeId);
            log(error?.message);
            throw new Error(FEATURE_ERROR);
          });
      });
  },
  getGeoJSON: (featureTypeId: string) => {
    return getCogniteSDKClient()
      .geospatial.feature.search(
        `${DISCOVER_FEATURE_TYPE_PREFIX}${featureTypeId}`,
        {
          output: { geometryFormat: 'GEOJSON' },
        }
      )
      .then((features) => adaptGeospatialToGeoJSON(features));
  },
  deleteFeatureType: (featureTypeId: string, params = { recursive: true }) => {
    return getCogniteSDKClient().geospatial.featureType.delete(
      [{ externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${featureTypeId}` }],
      params
    );
  },
  getFeatureType: (featureTypeId: string) => {
    return getCogniteSDKClient().geospatial.featureType.retrieve([
      { externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${featureTypeId}` },
    ]);
  },
};
