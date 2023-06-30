import { useCallback, useMemo, useState } from 'react';

import { WorkflowState } from '@charts-app/models/calculation-results/types';
import { Chart } from '@charts-app/models/chart/types';
import { updateSourceAxisForChart } from '@charts-app/models/chart/updates';
import { selectedEventsAtom } from '@charts-app/models/event-results/atom';
import { ChartEventResults } from '@charts-app/models/event-results/types';
import { InteractionData } from '@charts-app/models/interactions/types';
import { ScheduledCalculationsDataMap } from '@charts-app/models/scheduled-calculation-results/types';
import { TimeseriesEntry } from '@charts-app/models/timeseries-results/types';
import { useRecoilValue } from 'recoil';

import { ChartingContainer } from './elements';
import PlotlyChart, { PlotNavigationUpdate } from './PlotlyChart';
import { cleanTimeseriesCollection, cleanWorkflowCollection } from './utils';

type Props = {
  chart?: Chart;
  setChart?: (
    valOrUpdater: ((currVal: Chart | undefined) => Chart) | Chart
  ) => void;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
  timeseriesData: TimeseriesEntry[];
  calculationsData: WorkflowState[];
  scheduledCalculationsData: ScheduledCalculationsDataMap;
  eventData?: ChartEventResults[];
  interactionData?: InteractionData;
};

const ChartPlotContainer = ({
  chart = undefined,
  setChart = (val) => val,
  isYAxisShown = true,
  isMinMaxShown = false,
  isGridlinesShown = false,
  stackedMode = false,
  mergeUnits = false,
  timeseriesData = [],
  calculationsData = [],
  scheduledCalculationsData = {},
  eventData = [],
  interactionData,
}: Props) => {
  const [dragmode, setDragmode] = useState<'zoom' | 'pan'>('pan');

  /**
   * Get local chart context
   */
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  /**
   * Filter out callIDs that trigger unnecessary recalcs/rerenders
   */
  const tsCollectionAsString = JSON.stringify(
    cleanTimeseriesCollection(chart?.timeSeriesCollection || [])
  );
  const wfCollectionAsString = JSON.stringify(
    cleanWorkflowCollection(chart?.workflowCollection || [])
  );

  const timeseries = useMemo(
    () => JSON.parse(tsCollectionAsString),
    [tsCollectionAsString]
  );

  const calculations = useMemo(
    () => JSON.parse(wfCollectionAsString),
    [wfCollectionAsString]
  );

  // no need to clean this as there are no call references in this
  const scheduledCalculations = chart?.scheduledCalculationCollection;

  const thresholds = chart?.thresholdCollection;

  const storedSelectedEvents = useRecoilValue(selectedEventsAtom);

  const handleChartNavigation = useCallback(
    ({ x, y, dragmode: newDragmode }: PlotNavigationUpdate) => {
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, {
          x,
          y: !stackedMode ? y : [],
        })
      );

      if (newDragmode) {
        setDragmode(newDragmode);
      }
    },
    [setChart, stackedMode]
  );

  const hasValidDates =
    !Number.isNaN(new Date(dateFrom || '').getTime()) &&
    !Number.isNaN(new Date(dateTo || '').getTime());

  if (!hasValidDates) {
    return null;
  }

  const plotProps: React.ComponentProps<typeof PlotlyChart> = {
    dateFrom,
    dateTo,
    timeseries,
    timeseriesData,
    calculations,
    calculationsData,
    scheduledCalculations,
    scheduledCalculationsData,
    eventData,
    thresholds,
    storedSelectedEvents,
    isYAxisShown,
    isMinMaxShown,
    isGridlinesShown,
    stackedMode,
    mergeUnits,
    dragmode,
    interactionData,
    onPlotNavigation: handleChartNavigation,
  };

  return (
    <ChartingContainer>
      <PlotlyChart {...plotProps} />
    </ChartingContainer>
  );
};

export default ChartPlotContainer;
