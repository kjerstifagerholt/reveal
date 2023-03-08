import React from 'react';

import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useEventsFilters,
  useFilterEmptyState,
  useResetEventsFilters,
} from '@data-exploration-app/store/filter';
import {
  AggregatedEventFilterV2,
  DateFilterV2,
  MetadataFilterV2,
  SourceFilter,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { CogniteEvent } from '@cognite/sdk/dist/src';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks/flags/useFlagAdvancedFilters';
import {
  transformNewFilterToOldFilter,
  useEventsMetadataKeysAggregateQuery,
  useEventsMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';

export const EventFilters = ({ ...rest }: Record<string, unknown>) => {
  const [eventFilter, setEventFilter] = useEventsFilters();
  const resetEventFilters = useResetEventsFilters();
  const isFiltersEmpty = useFilterEmptyState('event');
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const { data: metadataKeys = [] } = useEventsMetadataKeysAggregateQuery();

  const { data: items = [] } = useList<CogniteEvent>('events', {
    filter: transformNewFilterToOldFilter(eventFilter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Events"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetEventFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <AggregatedEventFilterV2
          field="type"
          filter={isAdvancedFiltersEnabled ? {} : eventFilter}
          setValue={(newValue) => {
            setEventFilter({ type: newValue });
          }}
          title="Type"
          value={eventFilter.type || []}
          isMulti={isAdvancedFiltersEnabled}
        />
        <DateFilterV2
          title="Start time"
          value={eventFilter.startTime}
          setValue={(newDate) =>
            setEventFilter({
              startTime: newDate || undefined,
            })
          }
        />
        <DateFilterV2
          title="End time"
          enableNull
          value={
            eventFilter.endTime && 'isNull' in eventFilter.endTime
              ? null
              : eventFilter.endTime
          }
          setValue={(newDate) =>
            setEventFilter({
              endTime:
                newDate === null ? { isNull: true } : newDate || undefined,
            })
          }
        />
        <AggregatedEventFilterV2
          field="subtype"
          filter={isAdvancedFiltersEnabled ? {} : eventFilter}
          setValue={(newValue) => {
            setEventFilter({ subtype: newValue });
          }}
          title="Sub-type"
          value={eventFilter.subtype || []}
          isMulti={isAdvancedFiltersEnabled}
        />
        {/* <ByAssetFilter
          value={eventF.assetSubtreeIds?.map((el) => (el as InternalId).id)}
          setValue={(newValue) =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map((id) => ({ id })),
            })
          }
        /> */}
        <SourceFilter
          items={items}
          value={eventFilter.sources}
          onChange={(newSources) =>
            setEventFilter({
              sources: newSources,
            })
          }
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
        />
        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={eventFilter.metadata}
          setValue={(newMetadata) =>
            setEventFilter({
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={useEventsMetadataValuesAggregateQuery}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
