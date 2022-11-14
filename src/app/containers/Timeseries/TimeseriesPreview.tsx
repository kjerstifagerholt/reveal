import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { Tabs } from '@cognite/cogs.js';
import {
  ErrorFeedback,
  Loader,
  TimeseriesChart,
  Metadata,
  TimeseriesDetails,
} from '@cognite/data-exploration';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';

import { useDateRange } from 'app/context/DateRangeContext';
import { useOnPreviewTabChange } from 'app/hooks/hooks';
import styled from 'styled-components';
import { DetailsTabWrapper } from 'app/containers/Common/element';
import { Breadcrumbs } from 'app/components/Breadcrumbs/Breadcrumbs';

export type TimeseriesPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const TimeseriesPreview = ({
  timeseriesId,
  actions,
}: {
  timeseriesId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: TimeseriesPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const tabChange = useOnPreviewTabChange(tabType, 'timeseries');
  const [dateRange, setDateRange] = useDateRange();

  useEffect(() => {
    trackUsage('Exploration.Preview.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const {
    data: timeseries,
    isFetched,
    error,
  } = useCdfItem<Timeseries>('timeseries', { id: timeseriesId });

  if (!timeseriesId || !Number.isFinite(timeseriesId)) {
    return <>Invalid time series id {timeseriesId}</>;
  }
  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Timeseries {timeseriesId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs
        currentResource={{
          title:
            timeseries.name || timeseries.externalId || String(timeseries.id),
        }}
      />
      <ResourceTitleRow
        datefilter={{
          start: dateRange[0],
          end: dateRange[1],
        }}
        item={{ id: timeseriesId, type: 'timeSeries' }}
        afterDefaultActions={actions}
      />

      {timeseries && (
        <TimeseriesWrapper>
          <ResourceDetailsTabs
            parentResource={{
              type: 'timeSeries',
              id: timeseries.id,
              externalId: timeseries.externalId,
              title:
                timeseries.name ||
                timeseries.externalId ||
                String(timeseries.id),
            }}
            tab={activeTab}
            onTabChange={tabChange}
            additionalTabs={[
              <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="details">
                <DetailsTabWrapper>
                  <TimeseriesChartWrapper>
                    <TimeseriesChart
                      timeseriesId={timeseries.id}
                      showCustomRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </TimeseriesChartWrapper>
                  <TimeseriesDetails timeseries={timeseries} />
                  <Metadata metadata={timeseries.metadata} />
                </DetailsTabWrapper>
              </Tabs.TabPane>,
            ]}
          />
        </TimeseriesWrapper>
      )}
    </>
  );
};

const TimeseriesChartWrapper = styled.div`
  height: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TimeseriesWrapper = styled.div`
  overflow: auto;
  height: 100%;
`;
