import { InternalId } from '@cognite/sdk';
import React from 'react';
import { ResourceType } from 'types';
import { BaseFilterCollapse } from '../BaseFilterCollapse/BaseFilterCollapse';
import { ByAssetFilter } from '../ByAssetFilter/ByAssetFilter';
import { DataSetFilter } from '../DataSetFilter/DataSetFilter';
import { DateFilter } from '../DateFilter/DateFilter';
// import { MetadataFilter } from '../MetadataFilter/MetadataFilter';
import { StringFilter } from '../StringFilter/StringFilter';
import { CommonFilterFacets } from '../types';

interface Props {
  resourceType: ResourceType;
  commonFilter: CommonFilterFacets;
  onChange: (newValue: CommonFilterFacets) => void;
}
export const CommonFilter: React.FC<Props> = ({
  resourceType,
  commonFilter,
  onChange,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel title="Common" {...rest}>
      <DataSetFilter
        resourceType={resourceType}
        value={commonFilter.dataSetIds}
        setValue={newValue => onChange({ dataSetIds: newValue })}
      />
      <ByAssetFilter
        value={commonFilter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          onChange({ assetSubtreeIds: newValue?.map(id => ({ id })) })
        }
      />
      <DateFilter
        title="Created Time"
        value={commonFilter.createdTime}
        setValue={newValue => onChange({ createdTime: newValue || undefined })}
      />
      <DateFilter
        title="Updated Time"
        value={commonFilter.lastUpdatedTime}
        setValue={newValue =>
          onChange({ lastUpdatedTime: newValue || undefined })
        }
      />
      {/*  WIP
      <MetadataFilter
        items={[]}
        value={commonFilter.metadata}
        setValue={newValue => onChange({ metadata: newValue })}
      /> */}
      <StringFilter
        title="External ID"
        value={commonFilter.externalIdPrefix}
        setValue={newValue => onChange({ externalIdPrefix: newValue })}
      />
    </BaseFilterCollapse.Panel>
  );
};
