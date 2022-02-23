import { useContext, useMemo, useState } from 'react';
import { Body, Button, Flex, Icon, Overline, Title } from '@cognite/cogs.js';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import ResourceIcon from 'components/utils/ResourceIcon';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import moment from 'moment';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';
import Loading from 'components/utils/Loading';

import TimeSeriesPreview from '../TimeSeriesPreview';
import ShareButton from '../ShareButton';

import {
  Actions,
  Container,
  Header,
  MetadataItem,
  MetadataList,
  Preview,
} from './elements';

export type TimeSeriesSidebarProps = {
  timeSeries: Timeseries;
};

const TimeSeriesDownloadButton = ({
  timeSeries,
}: {
  timeSeries: Timeseries;
}) => {
  const { data: datapoints, isLoading } = useDatapointsQuery(
    [{ id: timeSeries.id }],
    {
      limit: 1000,
    }
  );

  const data = useMemo(
    () => ({ ...timeSeries, datapoints: datapoints?.[0]?.datapoints }),
    [timeSeries, datapoints]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <a
      className="cogs-btn cogs-btn-secondary cogs-btn-tiny cogs-btn-tiny--padding cogs-btn-icon-only"
      href={`data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data)
      )}`}
      download={`${timeSeries.id}.json`}
    >
      <Icon type="Download" />
    </a>
  );
};

const TimeSeriesSidebar = ({ timeSeries }: TimeSeriesSidebarProps) => {
  const { client } = useContext(CogniteSDKContext);
  const { data: datapoints, isLoading } = useDatapointsQuery(
    [{ id: timeSeries.id }],
    { latestOnly: true }
  );

  const latestDatapoint = useMemo(
    () => datapoints?.[0]?.datapoints[0] as DoubleDatapoint,
    [datapoints]
  );

  const handleOpenInCharts = () => {
    const endTime = latestDatapoint.timestamp.valueOf();
    const startTime = moment(endTime).subtract(1, 'month').valueOf();
    const url = `https://charts.cogniteapp.com/${client.project}?timeserieIds=${timeSeries.id}&startTime=${startTime}&endTime=${endTime}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      <Header>
        <ResourceIcon type="Timeseries" />
        <Title level={5} className="timeseries-sidebar--title">
          {timeSeries.name}
        </Title>
      </Header>
      {!isLoading && latestDatapoint && (
        <Preview>
          <Overline level={1}>Last reading</Overline>
          <Flex justifyContent="space-between" style={{ width: '100%' }}>
            <span>
              {latestDatapoint?.value.toPrecision(4)} {timeSeries.unit}
            </span>
            <span>{moment(latestDatapoint?.timestamp).fromNow()}</span>
          </Flex>
          <TimeSeriesPreview timeSeries={timeSeries} showYAxis />
        </Preview>
      )}
      <Actions>
        <Button
          size="small"
          type="primary"
          icon="MergedChart"
          className="timeseries-sidebar--open-in-charts"
          onClick={handleOpenInCharts}
        >
          Open in Charts
        </Button>
        <ShareButton />
        <TimeSeriesDownloadButton timeSeries={timeSeries} />
      </Actions>
      <MetadataList>
        <MetadataItem>
          <Body level={2} strong>
            Description
          </Body>
          <Body level={2}>{timeSeries.description}</Body>
        </MetadataItem>
        {Object.keys(timeSeries.metadata || {}).map((key) => (
          <MetadataItem key={key}>
            <Body level={2} strong>
              {key}
            </Body>
            <Body level={2}>{timeSeries.metadata?.[key]}</Body>
          </MetadataItem>
        ))}
      </MetadataList>
    </Container>
  );
};

export default TimeSeriesSidebar;
