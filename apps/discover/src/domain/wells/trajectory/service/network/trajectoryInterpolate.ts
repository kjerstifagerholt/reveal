import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import {
  DistanceUnitEnum,
  TrajectoryInterpolationItems,
  TrajectoryInterpolationRequest,
  TrueVerticalDepths,
  Wellbore,
} from '@cognite/sdk-wells-v3';

import { showErrorMessage } from 'components/Toast';
import { SOMETHING_WENT_WRONG_FETCHING_TVD } from 'constants/error';

export interface ResponseItemType {
  wellboreMatchingId: string;
  wellboreAssetExternalId: string;
}

/**
 * DEPRECATED!
 * @todo(PP-2984)
 * DEPRECATED!
 */

/**
 * @deprecated use useInterpolateTvdQuery
 */
export const getTrajectoryInterpolateTVDs = async (
  responseItems: ResponseItemType[],
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
): Promise<Record<Wellbore['matchingId'], TrueVerticalDepths[]>> => {
  return getWellSDKClient()
    .trajectories.interpolate({
      items: trajectoryInterpolationRequests,
      ignoreUnknownMeasuredDepths: true,
      // This will be enabled in another PR, right now it's producing a weird infinity loop bug
      ignoreMissingTrajectories: true,
    })
    .then((interpolationItems: TrajectoryInterpolationItems) => {
      // we need this otherwise there is a runtime error resulting in an infinite loop
      if (isEmpty(interpolationItems.items)) {
        return groupBy(
          getDummyTrueVerticalDepths(responseItems),
          'wellboreMatchingId'
        );
      }

      return groupBy(interpolationItems.items, 'wellboreMatchingId');
    })
    .catch(() => {
      showErrorMessage(SOMETHING_WENT_WRONG_FETCHING_TVD);

      return groupBy(
        getDummyTrueVerticalDepths(responseItems),
        'wellboreMatchingId'
      );
    });
};

/**
 * @deprecated use useInterpolateTvdQuery
 */
export const getDummyTrueVerticalDepths = (
  responseItems: ResponseItemType[]
): TrueVerticalDepths[] => {
  return responseItems.map((item) => ({
    trueVerticalDepths: [],
    measuredDepths: [],
    trueVerticalDepthUnit: {
      unit: DistanceUnitEnum.Meter,
    },
    sequenceSource: {
      sequenceExternalId: '',
      sourceName: '',
    },
    wellboreAssetExternalId: item.wellboreAssetExternalId,
    wellboreMatchingId: item.wellboreMatchingId,
  }));
};

/**
 * @deprecated use useInterpolateTvdQuery
 */
export const getTVDForMD = (
  tvdsForWellbore: TrueVerticalDepths,
  md: number
) => {
  const measuredDepthIndex = tvdsForWellbore.measuredDepths.indexOf(md);
  return tvdsForWellbore.trueVerticalDepths[measuredDepthIndex];
};
