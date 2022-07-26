import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';
import { WdlMeasurementType } from 'domain/wells/measurements/service/types';
import { getWellboreTitle } from 'domain/wells/wellbore/internal/selectors/getWellboreTitle';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { Distance } from 'convert-units';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import uniqBy from 'lodash/uniqBy';
import { PlotData } from 'plotly.js';
import { pluralize } from 'utils/pluralize';
import { convertPressure, changeUnitTo } from 'utils/units';

import { PressureUnit, UserPreferredUnit } from 'constants/units';
import { DataError, Errors } from 'modules/inspectTabs/types';
import {
  MEASUREMENT_CURVE_CONFIG_V3 as MEASUREMENT_CURVE_CONFIG,
  MEASUREMENT_EXTERNAL_ID_CONFIG,
} from 'modules/wellSearch/constants';
import {
  MeasurementChartData,
  MeasurementType,
  GeoPpfgFilterTypes,
  ProcessedData,
  WellboreProcessedData,
} from 'modules/wellSearch/types';

import { MeasurementView, MeasurementViewMap } from './types';

const ANGLE_CURVES_UNIT = 'deg';
const CHART_BREAK_POINTS = [0, -9999, null];

const EMPTY_DATA = Object.freeze({
  chartData: [],
  errors: [],
});

export const formatChartData = (
  measurements: MeasurementView[],
  geomechanicsCurves: DepthMeasurementDataColumnInternal[], // currently enabled geomechanics curves from filters
  ppfgCurves: DepthMeasurementDataColumnInternal[], // currently enabled ppfg curves from filters
  otherTypes: DepthMeasurementDataColumnInternal[], // currently enabled other curves from filters
  userPreferedPressureUnit: PressureUnit,
  userPreferedDepthMeasurementUnit: UserPreferredUnit
) => {
  const processedCurves: string[] = [];

  return (measurements || []).reduce((processedData, measurement) => {
    // No rows
    if (isEmpty(measurement.rows)) {
      return EMPTY_DATA;
    }

    if (!measurement || isEmpty(measurement.columns)) {
      return EMPTY_DATA;
    }

    const tvdUnit = measurement.depthColumn.unit;

    const currentMeasurementProcessedData = measurement.columns.reduce(
      (processedData, column) => {
        const processedDataOfCurrentColumn = mapMeasurementToPlotly(
          column,
          measurement,
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          tvdUnit,
          userPreferedPressureUnit,
          userPreferedDepthMeasurementUnit,
          processedCurves
        );
        return {
          chartData: [
            ...processedData.chartData,
            ...processedDataOfCurrentColumn.chartData,
          ],
          errors: uniqBy(
            [...processedData.errors, ...processedDataOfCurrentColumn.errors],
            'message'
          ),
        };
      },
      EMPTY_DATA as ProcessedData
    );
    return {
      chartData: [
        ...processedData.chartData,
        ...currentMeasurementProcessedData.chartData,
      ],
      errors: uniqBy(
        [...processedData.errors, ...currentMeasurementProcessedData.errors],
        'message'
      ),
    };
  }, EMPTY_DATA as ProcessedData);
};

export const mapMeasurementToPlotly = (
  column: DepthMeasurementDataColumnInternal,
  depthMeasurementData: MeasurementView,
  geomechanicsCurves: DepthMeasurementDataColumnInternal[], // currently enabled geomechanics curves from filters
  ppfgCurves: DepthMeasurementDataColumnInternal[], // currently enabled ppfg curves from filters
  otherTypes: DepthMeasurementDataColumnInternal[], // currently enabled other curves from filters
  tvdUnit: Distance,
  userPreferedPressureUnit: PressureUnit,
  userPreferedDepthMeasurementUnit: UserPreferredUnit,
  processedCurves: string[] = []
): ProcessedData => {
  const measurementType = resolveMeasurementType(column.measurementType);

  if (isUndefined(measurementType)) {
    return {
      chartData: [],
      errors: [
        {
          message: `Cannot resolve measurement type ${column.measurementType}`,
        },
      ],
    };
  }

  const filterType = getFilterType(measurementType);

  if (
    isEmpty(ppfgCurves) &&
    isEmpty(geomechanicsCurves) &&
    isEmpty(otherTypes)
  ) {
    return EMPTY_DATA;
  }

  const { detailCardTitle, enabledCurves } =
    getEnabledCurvesAndCardTitleForFilterType(
      filterType,
      geomechanicsCurves,
      ppfgCurves,
      otherTypes
    );

  return enabledCurves.reduce((processedData, enabledCurve) => {
    const chartDataListForCurrentCurve = mapCurveToPlotly(
      enabledCurve,
      processedCurves,
      detailCardTitle,
      depthMeasurementData,
      tvdUnit,
      userPreferedDepthMeasurementUnit,
      userPreferedPressureUnit,
      measurementType
    );

    if (isUndefined(chartDataListForCurrentCurve)) {
      return processedData;
    }

    return {
      chartData: [
        ...processedData.chartData,
        ...chartDataListForCurrentCurve.chartData,
      ],
      errors: [...processedData.errors, ...chartDataListForCurrentCurve.errors],
    };
  }, EMPTY_DATA as ProcessedData);
};

const getEnabledCurvesAndCardTitleForFilterType = (
  filterType: GeoPpfgFilterTypes,
  geomechanicsCurves: DepthMeasurementDataColumnInternal[],
  ppfgCurves: DepthMeasurementDataColumnInternal[],
  otherTypes: DepthMeasurementDataColumnInternal[]
) => {
  let detailCardTitle = '';
  let enabledCurves: DepthMeasurementDataColumnInternal[] = [];

  if (filterType === GeoPpfgFilterTypes.GEOMECHANNICS) {
    enabledCurves = geomechanicsCurves;
    detailCardTitle = 'Geomechanics';
  } else if (filterType === GeoPpfgFilterTypes.PPFG) {
    enabledCurves = ppfgCurves;
    detailCardTitle = 'PPFG';
  } else {
    enabledCurves = otherTypes;
    detailCardTitle = 'Other';
  }
  return {
    detailCardTitle,
    enabledCurves,
  };
};

/**
 *
 * Maps a curve ( column of sequence ) to plotly to generate the graph
 * Basically loop thought row data can map them in to x, y coordinates
 * incude other configuration like colors etc
 *
 * @param curve Which column we are processing
 * @param processedCurves
 * @param detailCardTitle
 * @param depthMeasurementData Object with curve(column) data
 * @param tvdUnit y axis unit ( a depth unit )
 * @param userPreferedDepthMeasurementUnit Depth unit to which data value should be converted to
 * @param userPreferedPressureUnit Pressure unit to which data value should be converted to
 * @param measurementType Measurement type Geo, Ppfg, lot or fit
 * @returns
 */
export const mapCurveToPlotly = (
  DepthMeasurementDataColumnInternal: DepthMeasurementDataColumnInternal,
  processedCurves: string[],
  detailCardTitle: string,
  depthMeasurementData: MeasurementView,
  tvdUnit: Distance,
  userPreferedDepthMeasurementUnit: UserPreferredUnit,
  userPreferedPressureUnit: PressureUnit,
  measurementType: MeasurementType
): ProcessedData => {
  const chartData: MeasurementChartData[] = [];
  const errors: DataError[] = [];
  const curveDescription = `${DepthMeasurementDataColumnInternal.externalId} (${detailCardTitle})`;

  /**
   * I'm not sure why we have this. Can there be duplicate curves in row data. It is the only scenario
   * this condition could have met. Still scared to remove it.
   */
  if (processedCurves.includes(curveDescription)) {
    return EMPTY_DATA;
  }

  /**
   * We don't recognize this measurement type
   * Just a precausion, we fetch by measurement type
   */
  if (isUndefined(measurementType)) {
    return EMPTY_DATA;
  }

  /**
   * Ploty config for the curve ( color, line etc)
   */
  const lineConfig =
    (MEASUREMENT_CURVE_CONFIG[measurementType] || {})[
      DepthMeasurementDataColumnInternal.externalId
    ] || MEASUREMENT_CURVE_CONFIG[measurementType]?.default;

  /**
   * This is used to pluck respective value from row data.
   */
  const columnIndex = depthMeasurementData.columns.findIndex(
    (column) =>
      column.externalId === DepthMeasurementDataColumnInternal.externalId
  );

  if (isUndefined(lineConfig) || columnIndex < 0) {
    return {
      chartData: [],
      errors: [
        {
          message: `Line config for ${DepthMeasurementDataColumnInternal.externalId} does not exist or data not found for curve`,
        },
      ],
    };
  }

  processedCurves.push(curveDescription);

  // Get column data unit
  const xUnit = depthMeasurementData.columns[columnIndex].unit || '';

  const isAngleCurve = xUnit === ANGLE_CURVES_UNIT;

  let x: number[] = [];
  let y: number[] = [];

  depthMeasurementData.rows.forEach((depthMeasurementRow) => {
    const yValue = depthMeasurementRow.depth as number;
    const pressureValue = depthMeasurementRow.values[columnIndex];
    const xValue = depthMeasurementRow.values[columnIndex] as number;

    const convertedYValue = changeUnitTo(
      yValue,
      tvdUnit,
      userPreferedDepthMeasurementUnit
    );
    if (!convertedYValue) {
      errors.push({
        message: `${yValue} of unit ${tvdUnit} could not converted to ${userPreferedDepthMeasurementUnit}`,
      });
    }

    /**
     * When then is a breaking point ( coordinates are not smooth but wayward) we break the chart (line)
     * from that point and draw a another one from the next coordinate
     */
    if (
      !convertedYValue ||
      isNull(pressureValue) ||
      CHART_BREAK_POINTS.includes(xValue) ||
      CHART_BREAK_POINTS.includes(yValue)
    ) {
      // If this is the first value it should be ok
      if (isEmpty(x)) return;
      // Consider already collected values list as a one line and clear the arrays
      pushCurveToChart(
        chartData,
        measurementType,
        lineConfig,
        isAngleCurve,
        DepthMeasurementDataColumnInternal.externalId,
        curveDescription,
        x,
        y
      );
      // eslint-disable-next-line no-param-reassign
      x = [];
      // eslint-disable-next-line no-param-reassign
      y = [];
      /**
       * Skipping the breaking point coordinates
       */
      return;
    }

    y.push(convertedYValue);
    if (isAngleCurve) {
      x.push(xValue);
    } else {
      x.push(
        convertPressure(
          xValue,
          xUnit,
          yValue,
          tvdUnit,
          userPreferedPressureUnit
        )
      );
    }
  });

  pushCurveToChart(
    chartData,
    measurementType,
    lineConfig,
    isAngleCurve,
    DepthMeasurementDataColumnInternal.externalId,
    curveDescription,
    x,
    y
  );

  return {
    chartData,
    errors,
  };
};

export const pushCurveToChart = (
  chartData: MeasurementChartData[],
  measurementType: MeasurementType,
  lineConfig: Partial<PlotData>,
  isAngleCurve: boolean,
  curveName: string,
  curveDescription: string,
  x: number[],
  y: number[]
) => {
  const curveData: MeasurementChartData = {
    ...lineConfig,
    x,
    y,
    type: 'scatter',
    mode: isMeasurementTypeFitOrLot(measurementType) ? 'markers' : 'lines',
    name: curveName,
    customdata: [curveDescription],
    xaxis: isAngleCurve ? 'x2' : undefined,
    measurementType,
  };
  /**
   * For FIT and LOT we don't mind even one or two data points for others we expect more than two to draw a plot
   * https://cognitedata.atlassian.net/browse/PP-2220
   */
  if (isMeasurementTypeFitOrLot(measurementType) || x.length > 2) {
    chartData.push(curveData);
  }
};

export const mapToCurveCentric = (
  data: MeasurementChartData[],
  wellbore: WellboreInternal
) =>
  data.map((row) => ({
    ...row,
    customdata: [wellbore.wellName || '', getWellboreTitle(wellbore)],
    ...(row.marker
      ? {
          marker: {
            ...row.marker,
            color: wellbore?.color,
            line: {
              color: wellbore?.color,
            },
          },
        }
      : {
          line: {
            ...row.line,
            color: wellbore?.color,
          },
        }),
  }));

export const mapToCompareView = (
  data: {
    wellbore: WellboreInternal;
    chartData: MeasurementChartData[];
  }[]
) =>
  groupBy(
    flatten(
      data.map(({ wellbore, chartData }) =>
        chartData.map((row) => {
          const wellboreTitle = getWellboreTitle(wellbore);
          const curveDescription = row.customdata
            ? (row.customdata[0] as string)
            : '';
          const chart: MeasurementChartData = {
            ...row,
            xaxis: !row.xaxis ? 'x' : row.xaxis,
            customdata: [curveDescription, wellboreTitle],
          };
          return chart;
        })
      )
    ),
    'xaxis'
  );

export const filterByChartType = (
  charts: MeasurementChartData[],
  types: string[]
) => charts.filter((chart) => types.includes(chart.measurementType));

export const filterByMainChartType = (charts: MeasurementChartData[]) =>
  charts.filter((chart) =>
    [MeasurementType.GEOMECHANNICS, MeasurementType.PPFG].find(
      (measurementType) => {
        return measurementType === chart.measurementType;
      }
    )
  );

export const resolveMeasurementType = (measurementType: string) =>
  Object.keys(MEASUREMENT_EXTERNAL_ID_CONFIG).find((measurementTypeOfCurve) =>
    Object.values(
      MEASUREMENT_EXTERNAL_ID_CONFIG[measurementTypeOfCurve as MeasurementType]
    ).find((type) => type === (measurementType as WdlMeasurementType))
  ) as MeasurementType;

export const getFilterType = (measurementType: MeasurementType) => {
  switch (measurementType) {
    case MeasurementType.GEOMECHANNICS:
      return GeoPpfgFilterTypes.GEOMECHANNICS;
    case MeasurementType.PPFG:
      return GeoPpfgFilterTypes.PPFG;
    default:
      return GeoPpfgFilterTypes.OTHER;
  }
};

export const getSelectedWellboresTitle = (count: number) =>
  `${count} ${pluralize('wellbore', count)} selected`;

export const getSelectedWellsTitle = (count: number) =>
  `From ${count} ${pluralize('well', count)}`;

export const getMeasurementDataFetchErrors = (data: MeasurementViewMap) => {
  return Object.keys(data).reduce((results, wellboreId) => {
    const measurements = data[wellboreId];
    const errors = flatten(
      measurements
        .filter(({ errors }) => !isEmpty(errors))
        .map(({ errors }) => errors)
        .filter((error): error is DataError[] => !!error)
    );
    return {
      ...results,
      [wellboreId]: errors,
    };
  }, {} as Errors);
};

export const extractChartDataFromProcessedData = (
  wellboreProcessedData: WellboreProcessedData[]
) => {
  return wellboreProcessedData
    .map(({ wellbore, proccessedData }) => ({
      wellbore,
      chartData: proccessedData.chartData,
    }))
    .filter((row) => !isEmpty(row.chartData));
};

export const extractWellboreErrorsFromProcessedData = (
  wellboreProcessedData: WellboreProcessedData[]
) => {
  return wellboreProcessedData.reduce(
    (wellboreErrors, wellboreProcessedData) => {
      return {
        ...wellboreErrors,
        [wellboreProcessedData.wellbore.matchingId || '']:
          wellboreProcessedData.proccessedData.errors || [],
      };
    },
    {} as Errors
  );
};

export const isMeasurementTypeFitOrLot = (measurementType: MeasurementType) =>
  [MeasurementType.FIT, MeasurementType.LOT].includes(measurementType);
