import React from 'react';
import { MetadataItem } from 'components/DetailsSidebar';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';

type MetadataListProps = {
  timeseriesId: number;
};

export const MetadataList = ({ timeseriesId }: MetadataListProps) => {
  const { data: timeseries, isLoading } = useCdfItem<Timeseries>('timeseries', {
    id: timeseriesId,
  });

  if (isLoading) {
    return <Icon type="Loading" />;
  }

  return (
    <>
      <MetadataItem label="Name" value={timeseries?.name} copyable />
      <MetadataItem label="ID" value={timeseries?.id} copyable />
      <MetadataItem
        label="Is Step"
        value={timeseries?.isStep ? 'True' : 'False'}
      />
      <MetadataItem label="Created At" value={timeseries?.createdTime} />
      <MetadataItem label="Description" value={timeseries?.description} />
      <MetadataItem
        label="External ID"
        value={timeseries?.externalId}
        copyable
      />
      <MetadataItem label="Dataset" value={undefined} />
      <MetadataItem label="Updated At" value={timeseries?.lastUpdatedTime} />
      <MetadataItem label="Unit" value={timeseries?.unit} />
      <MetadataItem
        label="Is String"
        value={timeseries?.isString ? 'True' : 'False'}
      />
      <MetadataItem label="Linked assets" value={undefined} />
    </>
  );
};
