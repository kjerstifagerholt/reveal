import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { ZoomOutButton, ZoomInButton, ResetZoomButton } from './Buttons';
import { Axes } from './common/Axes';
import { Axis } from './common/Axis';
import { Bars } from './common/Bars';
import { Legend } from './common/Legend';
import {
  DEFAULT_MARGINS,
  DEFAULT_X_AXIS_SPACING,
  DEFAULT_Y_AXIS_SPACING,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_ZOOM_STEP_SIZE,
  DEFAULT_X_AXIS_PLACEMENT,
  X_AXIS_LABELS_HEIGHT,
  LEGEND_FLOATING_HEIGHT,
} from './constants';
import {
  StackedBarChartWrapper,
  ChartStickyElement,
  ChartDetailsContainer,
  ChartActionButtonsContainer,
  ChartTitle,
  ChartSubtitle,
  AxisLabel,
  ChartContainer,
  ChartSVG,
} from './elements';
import { useChartScales } from './hooks/useChartScales';
import { useGroupedData } from './hooks/useGroupedData';
import { useXScaleMaxValue } from './hooks/useXScaleMaxValue';
import { useZoomableChart } from './hooks/useZoomableChart';
import { ResetToDefault } from './ResetToDefault';
import {
  AxisPlacement,
  DataObject,
  LegendCheckboxState,
  StackedBarChartProps,
} from './types';
import {
  getCheckedLegendCheckboxOptions,
  getDefaultBarColorConfig,
  getFilteredData,
  getLegendInitialCheckboxState,
} from './utils';

export const StackedBarChart = <T extends DataObject<T>>({
  data,
  xAxis,
  yAxis,
  yScaleDomain: yScaleDomainOriginal,
  groupDataInsideBarsBy,
  title,
  subtitle,
  options,
  onUpdate,
  onSelectBar,
}: StackedBarChartProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [legendCheckboxState, setLegendCheckboxState] =
    useState<LegendCheckboxState>({});

  const stringifiedData = JSON.stringify(data);
  const margins = { ...DEFAULT_MARGINS, ...options?.margins };

  const xAccessor = xAxis.accessor;
  const yAccessor = yAxis.accessor;

  const xAxisPlacement = xAxis.placement || DEFAULT_X_AXIS_PLACEMENT;
  const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;

  const barColorConfig =
    options?.barColorConfig ||
    getDefaultBarColorConfig(options?.legendOptions?.accessor);

  const isolateLegend = !isUndefined(options?.legendOptions?.isolate)
    ? options?.legendOptions?.isolate
    : true;

  const initialCheckboxState: LegendCheckboxState = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return {};

    const checkboxState = getLegendInitialCheckboxState<T>(
      data,
      barColorConfig.accessor
    );

    setLegendCheckboxState(checkboxState);
    return checkboxState;
  }, [stringifiedData]);

  useEffect(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
  }, [stringifiedData, initialCheckboxState]);

  const spacings = {
    x: xAxis.spacing || DEFAULT_X_AXIS_SPACING,
    y: yAxis.spacing || DEFAULT_Y_AXIS_SPACING,
  };

  const initialGroupedData = useGroupedData<T>({
    data,
    xAccessor,
    yAccessor,
    groupDataInsideBarsBy,
    options,
  });

  const groupedData = useGroupedData<T>({
    data: filteredData,
    xAccessor,
    yAccessor,
    groupDataInsideBarsBy,
    options,
  });

  const xScaleMaxValue = useXScaleMaxValue<T>({
    groupedData,
    xAccessor,
  });

  const {
    chartDimensions,
    zoomIn,
    zoomOut,
    resetZoom,
    disableZoomIn,
    disableZoomOut,
    zoomFactor,
  } = useZoomableChart<T>({
    chartRef,
    groupedData,
    margins,
    spacings,
    xScaleMaxValue,
    zoomStepSize: options?.zoomStepSize || DEFAULT_ZOOM_STEP_SIZE,
  });

  const { xScale, yScale, yScaleDomain } = useChartScales<T>({
    data: filteredData,
    chartDimensions,
    margins,
    xScaleMaxValue,
    yAccessor,
    yScaleDomain: yScaleDomainOriginal,
  });

  const xAxisTicks = useMemo(
    () => (xAxis.ticks || DEFAULT_X_AXIS_TICKS) + zoomFactor,
    [zoomFactor]
  );

  const handleOnChangeLegendCheckbox = useCallback(
    (option: string, checked: boolean) => {
      if (isUndefined(barColorConfig)) return;

      setLegendCheckboxState((currentState) => {
        const updatedCheckboxState = {
          ...currentState,
          [option]: checked,
        };

        const filteredData = getFilteredData<T>(
          data,
          xAccessor,
          barColorConfig.accessor,
          updatedCheckboxState
        );

        setFilteredData(filteredData);
        return updatedCheckboxState;
      });

      if (onUpdate) onUpdate();
    },
    [stringifiedData]
  );

  const handleResetToDefault = useCallback(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
    if (onUpdate) onUpdate();
  }, [stringifiedData]);

  const handleSelectBar = useCallback(
    (key: string, index: number) => {
      if (onSelectBar) {
        onSelectBar({
          key,
          index,
          data: initialGroupedData[key],
          groupedData: initialGroupedData,
        });
      }
    },
    [stringifiedData]
  );

  const ChartDetails = useMemo(
    () => (
      <>
        {title && <ChartTitle>{title}</ChartTitle>}
        {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
      </>
    ),
    [title, subtitle]
  );

  const ChartActions = useMemo(
    () => (
      <ChartActionButtonsContainer>
        <ZoomOutButton onClick={zoomOut} disabled={disableZoomOut} />
        <ZoomInButton onClick={zoomIn} disabled={disableZoomIn} />
        <ResetZoomButton onClick={resetZoom} />
      </ChartActionButtonsContainer>
    ),
    [zoomIn, zoomOut, resetZoom, disableZoomIn, disableZoomOut]
  );

  /**
   * This is to render the x-axis with sticky values
   */
  const ChartXAxisSticky = useMemo(() => {
    const translate = isXAxisOnTop ? `translate(0, 22)` : `translate(0, 0)`;

    return (
      <ChartStickyElement
        width={chartDimensions.width}
        height={X_AXIS_LABELS_HEIGHT[xAxisPlacement]}
      >
        <Axis
          placement={xAxisPlacement}
          scale={xScale}
          translate={translate}
          ticks={xAxisTicks}
        />
      </ChartStickyElement>
    );
  }, [chartDimensions, xScale, xAxisTicks]);

  const ChartContent = useMemo(
    () => (
      <ChartSVG
        className="chart-content"
        width={chartDimensions.width}
        height={chartDimensions.height}
      >
        <Axes
          scales={{ x: xScale, y: yScale }}
          ticks={xAxisTicks}
          margins={margins}
          chartDimensions={chartDimensions}
        />

        <Bars
          initialGroupedData={initialGroupedData}
          groupedData={groupedData}
          scales={{ x: xScale, y: yScale }}
          yScaleDomain={yScaleDomain}
          accessors={{ x: xAccessor, y: yAccessor }}
          margins={margins}
          barComponentDimensions={{
            width: chartDimensions.width,
            height: spacings.y,
          }}
          options={options}
          onSelectBar={handleSelectBar}
        />
      </ChartSVG>
    ),
    [groupedData, chartDimensions, xScale, yScale, xAxisTicks]
  );

  const ChartLegend = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return null;

    const floatingHeight = options?.legendOptions?.overlay
      ? LEGEND_FLOATING_HEIGHT
      : undefined;

    return (
      <Legend
        checkboxState={legendCheckboxState}
        barColorConfig={barColorConfig}
        onChange={handleOnChangeLegendCheckbox}
        title={options?.legendOptions?.title}
        isolateLegend={isolateLegend}
        floatingHeight={floatingHeight}
      />
    );
  }, [legendCheckboxState]);

  const checkedLegendCheckboxOptions =
    getCheckedLegendCheckboxOptions(legendCheckboxState);

  const renderChart = () => {
    const offsetbottom =
      isolateLegend && options?.legendOptions?.overlay && isXAxisOnTop
        ? spacings.y
        : undefined;

    return (
      <>
        {isXAxisOnTop && xAxis.label && (
          <ChartDetailsContainer>
            <AxisLabel>{xAxis.label}</AxisLabel>
          </ChartDetailsContainer>
        )}

        <ChartContainer offsetbottom={offsetbottom}>
          {isXAxisOnTop && ChartXAxisSticky}
          {ChartContent}
          {!isXAxisOnTop && ChartXAxisSticky}
        </ChartContainer>

        {!isXAxisOnTop && xAxis.label && (
          <ChartDetailsContainer>
            <AxisLabel>{xAxis.label}</AxisLabel>
          </ChartDetailsContainer>
        )}
      </>
    );
  };

  const renderNoResultsPage = () => (
    <ResetToDefault handleResetToDefault={handleResetToDefault} />
  );

  return (
    <StackedBarChartWrapper ref={chartRef} className="stacked-bar-chart">
      <ChartDetailsContainer className="chart-details">
        {ChartDetails}
        {ChartActions}
      </ChartDetailsContainer>

      {isEmpty(checkedLegendCheckboxOptions)
        ? renderNoResultsPage()
        : renderChart()}

      {ChartLegend}
    </StackedBarChartWrapper>
  );
};
