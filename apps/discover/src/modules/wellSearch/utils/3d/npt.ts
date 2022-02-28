import convert from 'convert-units';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { UNITS_TO_STANDARD } from 'utils/units/constants';

import { IRiskEvent } from '@cognite/node-visualizer';
import { NPT as NptV2 } from '@cognite/sdk-wells-v2';
// import { Npt } from '@cognite/sdk-wells-v3';

import { FEET } from 'constants/units';

import { Well, WellboreNPTEventsMap } from '../../types';
import { getIdWellboreMap } from '../events';

// when we want to go native v3, we can do something like this:
// const convertV3MeasureDepthToFeet = (measuredDepth: Npt['measuredDepth']) => {
//   if (!measuredDepth) {
//     return undefined;
//   }

//   return convert(measuredDepth.value)
//     .from(get(UNITS_TO_STANDARD, measuredDepth.unit, measuredDepth.unit))
//     .to(FEET);
// };

const convertV2MeasureDepthToFeet = (measuredDepth: NptV2['measuredDepth']) => {
  if (!measuredDepth) {
    return undefined;
  }

  return convert(measuredDepth.value)
    .from(get(UNITS_TO_STANDARD, measuredDepth.unit, measuredDepth.unit))
    .to(FEET);
};

export const mapNPTTo3D = (
  eventsMap?: WellboreNPTEventsMap,
  wells?: Well[]
): Partial<IRiskEvent>[] => {
  if (!eventsMap) {
    return [];
  }
  if (!wells) {
    return [];
  }

  const wellbores = getIdWellboreMap(wells);
  return flatten(
    Object.keys(eventsMap).map((key) => {
      const wellboreId = key;
      const matchingEvents = eventsMap[wellboreId];
      if (!matchingEvents) {
        console.warn('Missing NPT event', { wellboreId });
        return [];
      }
      return matchingEvents.map((event) => {
        return {
          assetIds: [wellbores[wellboreId]?.id],
          subtype: event.subtype,
          description: event.description,
          metadata: {
            npt_md: `${convertV2MeasureDepthToFeet(event.measuredDepth)}`,
            description: '',
          },
        };
      });
    })
  );
};
