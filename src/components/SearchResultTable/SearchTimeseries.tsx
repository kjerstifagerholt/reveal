import React, { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { Timeseries } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
} from 'utils/charts';
import { calculateDefaultYAxis } from 'utils/axis';
import { trackUsage } from 'utils/metrics';
import InfoBox from 'components/InfoBox';
import TimeseriesSearchHit from './TimeseriesSearchHit';

type Props = {
  query: string;
};
export default function SearchTimeseries({ query }: Props) {
  const sdk = useSDK();
  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Timeseries>('timeseries', query, 20, undefined, {
    enabled: !!query,
  });
  const timeseries = useMemo(
    () => data?.pages?.reduce((accl, page) => accl.concat(page), []),
    [data]
  );

  if (!query) {
    return null;
  }

  if (isError) {
    return <Icon type="XLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loading" />;
  }
  if (timeseries?.length === 0) {
    return null;
  }

  const selectedIds: undefined | number[] = chart?.timeSeriesCollection?.map(
    (t) => t.tsId
  );

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    if (chart) {
      const tsToRemove = chart.timeSeriesCollection?.find(
        (t) => t.tsId === timeSeries.id
      );
      if (tsToRemove) {
        updateChart(removeTimeseries(chart, tsToRemove.id));
      } else {
        // Calculate y-axis / range
        const range = await calculateDefaultYAxis({
          chart,
          sdk,
          timeSeriesId: timeSeries.id,
        });

        const newTs = covertTSToChartTS(timeSeries, range);

        updateChart(addTimeseries(chart, newTs));
        trackUsage('ChartView.AddTimeSeries', { source: 'search' });
      }
    }
  };

  return (
    <TSList>
      <InfoBox infoType="TimeSeriesHelpBox" />
      <TimeseriesSearchHit
        timeseries={timeseries}
        renderCheckbox={(ts) => (
          <Checkbox
            onClick={(e) => {
              e.preventDefault();
              handleTimeSeriesClick(ts);
            }}
            name={`${ts.id}`}
            value={selectedIds?.includes(ts.id)}
          />
        )}
      />
      {hasNextPage && (
        <TSItem>
          <Button type="link" onClick={() => fetchNextPage()}>
            Additional time series
          </Button>
        </TSItem>
      )}
    </TSList>
  );
}

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;
