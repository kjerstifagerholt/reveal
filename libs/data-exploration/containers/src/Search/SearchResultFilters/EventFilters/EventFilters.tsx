import { FilterProps, SPECIFIC_INFO_CONTENT } from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  DateFilter,
  MetadataFilter,
  SourceFilter,
  SubTypeFilter,
  TypeFilter,
} from '../../../Filters';

export const EventFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const eventFilter = filter.event;
  const isResetButtonVisible = Boolean(
    eventFilter.sources ||
      eventFilter.metadata ||
      eventFilter.startTime ||
      eventFilter.endTime ||
      eventFilter.subtype ||
      eventFilter.type
  );
  return (
    <BaseFilterCollapse.Panel
      title="Events"
      hideResetButton={!isResetButtonVisible}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('event')}
      {...rest}
    >
      <TempMultiSelectFix>
        <TypeFilter.Event
          query={query}
          filter={eventFilter}
          value={eventFilter.type}
          onChange={(newFilters) =>
            onFilterChange('event', { type: newFilters })
          }
        />

        <DateFilter.StartTime
          value={eventFilter.startTime}
          onChange={(newFilters) =>
            onFilterChange('event', { startTime: newFilters || undefined })
          }
        />
        <DateFilter.EndTime
          value={
            eventFilter.endTime && 'isNull' in eventFilter.endTime
              ? null
              : eventFilter.endTime
          }
          onChange={(newDate) =>
            onFilterChange('event', {
              endTime:
                newDate === null ? { isNull: true } : newDate || undefined,
            })
          }
        />

        <SubTypeFilter.Event
          query={query}
          filter={eventFilter}
          value={eventFilter.subtype}
          onChange={(newFilters) =>
            onFilterChange('event', { subtype: newFilters })
          }
        />

        <SourceFilter.Event
          query={query}
          filter={eventFilter}
          value={eventFilter.sources}
          onChange={(newSources) =>
            onFilterChange('event', {
              sources: newSources,
            })
          }
        />
        <MetadataFilter.Events
          query={query}
          filter={eventFilter}
          values={eventFilter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('event', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
