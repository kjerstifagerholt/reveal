import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import {
  WaterDepthLimits as WaterDepthLimitsV2,
  SpudDateLimits as SpudDateLimitsV2,
  WellFilter as WellFilterV2,
  PolygonFilter as PolygonFilterV2,
  NPTFilter as NPTFilterV2,
  NPTItems as NPTItemsV2,
  NPT as NPTV2,
  LengthUnitEnum,
} from '@cognite/sdk-wells-v2';
import { DoubleWithUnit } from '@cognite/sdk-wells-v2/dist/src/client/model/DoubleWithUnit';
import {
  SourceItems as SourceItemsV3,
  WaterDepthLimits as WaterDepthLimitsV3,
  SpudDateLimits as SpudDateLimitsV3,
  WellFilter as WellFilterV3,
  WellFilterRequest,
  PropertyFilter,
  PolygonFilter as PolygonFilterV3,
  GeometryTypeEnum,
  DurationUnitEnum,
  ContainsAllOrAny,
  ContainsAllOrAnyInt,
  Identifier,
  WellItems,
  Wellbore as WellboreV3,
  NptFilter as NPTFilterV3,
  NptItems as NPTItemsV3,
  Npt as NPTV3,
  DurationRange,
  SummaryCount,
  AngleUnitEnum,
} from '@cognite/sdk-wells-v3';

import { EMPTY_ARRAY } from '../../../constants/empty';
import { adaptLocalDateToISOString } from '../../../utils/date';
import { CommonWellFilter } from '../types';

export const DEFAULT_DOUBLE_WITH_UNIT: DoubleWithUnit = {
  value: 0,
  unit: '',
};

export const mapV3ToV2SourceItems = (sourceItems: SourceItemsV3) => {
  return sourceItems.items.map((item) => String(item.name));
};

export const mapV3ToV2WellsWaterDepthLimits = (
  waterDepthLimits: WaterDepthLimitsV3
): WaterDepthLimitsV2 => {
  return {
    min: waterDepthLimits.min || DEFAULT_DOUBLE_WITH_UNIT,
    max: waterDepthLimits.max || DEFAULT_DOUBLE_WITH_UNIT,
  };
};

export const mapV3ToV2SpudDateLimits = (
  spudDateLimits: SpudDateLimitsV3
): SpudDateLimitsV2 => {
  return {
    min: new Date(spudDateLimits.min || ''),
    max: new Date(spudDateLimits.max || ''),
  };
};

export const mapSummaryCountsToStringArray = (
  summaryCounts: SummaryCount[]
): string[] => {
  return summaryCounts.map((summaryCount) => summaryCount.property);
};

export const toPropertyFilter = (
  filter?: string[]
): PropertyFilter | undefined => {
  if (isUndefined(filter)) return undefined;

  return {
    isSet: true,
    oneOf: filter,
  };
};

export const getGeometryAndGeometryType = (polygonFilter: PolygonFilterV2) => {
  if (!isUndefined(polygonFilter.wktGeometry)) {
    return {
      geometry: polygonFilter.wktGeometry,
      geometryType: GeometryTypeEnum.Wkt,
    };
  }

  if (!isUndefined(polygonFilter.geoJsonGeometry)) {
    return {
      geometry: polygonFilter.geoJsonGeometry,
      geometryType: GeometryTypeEnum.GeoJson,
    };
  }

  return {
    geometry: undefined,
    geometryType: undefined,
  };
};

export const mapV2toV3PolygonFilter = (
  polygonFilter?: PolygonFilterV2
): PolygonFilterV3 | undefined => {
  if (isUndefined(polygonFilter)) return undefined;

  const { geometry, geometryType } = getGeometryAndGeometryType(polygonFilter);

  return {
    geometry: JSON.stringify(geometry),
    crs: polygonFilter.crs,
    geometryType,
  };
};

export const mapV2ToV3DepthMeasurementFilter = (
  depthMeasurementFilter?: WellFilterV2['hasMeasurements']
): WellFilterV3['depthMeasurements'] => {
  const containsAny = depthMeasurementFilter?.containsAny || EMPTY_ARRAY;
  if (!isEmpty(containsAny)) {
    return {
      measurementTypes: {
        containsAny: containsAny.map(
          ({ measurementType }) => measurementType || ''
        ),
      },
    };
  }
  return undefined;
};

const undefinedIfAllKeysUndefined = (object: object) => {
  const allKeysUndefined = Object.values(object).every(isUndefined);
  return allKeysUndefined ? undefined : object;
};

export const mapV2toV3WellFilter = (
  wellFilter: CommonWellFilter
): WellFilterV3 => {
  const filters = {
    quadrant: toPropertyFilter(wellFilter.quadrants),
    region: toPropertyFilter(wellFilter.regions),
    block: toPropertyFilter(wellFilter.blocks),
    field: toPropertyFilter(wellFilter.fields),
    operator: toPropertyFilter(wellFilter.operators),
    wellType: toPropertyFilter(wellFilter.wellTypes),
    license: toPropertyFilter(wellFilter.licenses),
    sources: wellFilter.sources,
    waterDepth: wellFilter.waterDepth,
    spudDate: undefinedIfAllKeysUndefined({
      min:
        wellFilter.spudDate?.min &&
        adaptLocalDateToISOString(wellFilter.spudDate.min),
      max:
        wellFilter.spudDate?.max &&
        adaptLocalDateToISOString(wellFilter.spudDate.max),
    }),
    polygon: mapV2toV3PolygonFilter(wellFilter.polygon),
    trajectories: undefinedIfAllKeysUndefined({
      maxMeasuredDepth: wellFilter.hasTrajectory?.maxMeasuredDepth,
      maxTrueVerticalDepth: wellFilter.trajectories?.maxTrueVerticalDepth,
      maxDoglegSeverity: wellFilter.trajectories?.maxDoglegSeverity,
      maxInclination: wellFilter.hasTrajectory?.maxInclination
        ? {
            ...wellFilter.hasTrajectory?.maxInclination,
            unit: AngleUnitEnum.Degree,
          }
        : undefined,
    }),
    datum: wellFilter.datum,
    depthMeasurements: mapV2ToV3DepthMeasurementFilter(
      wellFilter.hasMeasurements
    ),
  } as WellFilterV3;

  if (wellFilter.npt && !isEmpty(wellFilter.npt)) {
    filters.npt = {
      ...wellFilter.npt,
      exists: true,
      duration: mapDoubleRangeToDurationRange(wellFilter.npt.duration),
    };
  }

  if (wellFilter.nds && !isEmpty(wellFilter.nds)) {
    filters.nds = {
      exists: true,
      severities: toContainsAllOrAnyInt(wellFilter.nds.severities),
      probabilities: toContainsAllOrAnyInt(wellFilter.nds.probabilities),
      riskTypes: toContainsAllOrAny(wellFilter.nds.riskTypes),
    };
  }

  return filters;
};

export const mapWellFilterToWellFilterRequest = (
  wellFilter: CommonWellFilter
): WellFilterRequest => {
  return {
    filter: mapV2toV3WellFilter(wellFilter),
    search: { query: wellFilter.stringMatching || '' },
    outputCrs: undefined,
    limit: undefined,
  };
};

export const toContainsAllOrAny = (
  items?: string[]
): ContainsAllOrAny | undefined => {
  if (isUndefined(items)) return undefined;
  return { containsAny: items };
};

export const toContainsAllOrAnyInt = (
  items?: number[]
): ContainsAllOrAnyInt | undefined => {
  if (isUndefined(items)) return undefined;
  return { containsAny: items };
};

export const toIdentifier = (id: number | string): Identifier => {
  return { matchingId: String(id) };
};

export const toIdentifierItems = (items: Identifier[]) => {
  return { items };
};

export const extractWellboresFromWells = (response: WellItems) => {
  return flatten(
    response.items.map((item) => item.wellbores || ([] as WellboreV3[]))
  );
};

export type NPTFilterV2WithV3WellboreIds = Omit<NPTFilterV2, 'wellboreIds'> & {
  wellboreIds?: string[];
};
export const mapV2toV3NPTFilter = (
  nptFilter: NPTFilterV2WithV3WellboreIds
): NPTFilterV3 => {
  return {
    measuredDepth: nptFilter.measuredDepth,
    duration: mapDoubleRangeToDurationRange(nptFilter.duration),
    nptCode: toPropertyFilter(nptFilter.nptCodes),
    nptCodeDetail: toPropertyFilter(nptFilter.nptCodeDetails),
    wellboreIds: nptFilter.wellboreIds?.map(toIdentifier),
  };
};

export const mapV3ToV2NPTItems = (nptItems: NPTItemsV3): NPTItemsV2 => {
  return {
    ...nptItems,
    items: nptItems.items.map(mapV3ToV2NPT),
  };
};

export const mapV3ToV2NPT = (npt: NPTV3): NPTV2 => {
  return {
    ...npt,
    parentExternalId: npt.wellboreAssetExternalId,
    parentType: '',
    sourceEventExternalId: npt.source.eventExternalId,
    source: npt.source.sourceName,
  };
};

export const mapDoubleRangeToDurationRange = (
  doubleRange?: DoubleRange
): DurationRange | undefined => {
  if (isUndefined(doubleRange)) return undefined;

  return {
    ...doubleRange,
    unit: DurationUnitEnum.Hour, // Since old data contains NPT duration in hours.
  };
};

export const unitToLengthUnitEnum = (unit: string): LengthUnitEnum => {
  switch (unit) {
    case 'ft':
      return LengthUnitEnum.FOOT;
    case 'm':
      return LengthUnitEnum.METER;
    default:
      throw new Error(`Unit (${unit}) is not supported by sdk`);
  }
};
