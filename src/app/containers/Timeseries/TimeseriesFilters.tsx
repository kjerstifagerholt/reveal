import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useResetTimeseriesFilters,
  useTimeseriesFilters,
} from 'app/store/filter';
import {
  AggregatedFilter,
  BooleanFilter,
  MetadataFilter,
} from '@cognite/data-exploration';

export const TimeseriesFilters = ({ ...rest }) => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const resetTimeseriesFilters = useResetTimeseriesFilters();

  const { data: items = [] } = useList('timeseries', {
    filter: timeseriesFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Time series"
      onResetClick={resetTimeseriesFilters}
      {...rest}
    >
      <BooleanFilter
        title="Is step"
        value={timeseriesFilter.isStep}
        setValue={newValue =>
          setTimeseriesFilter({
            isStep: newValue,
          })
        }
      />
      <BooleanFilter
        title="Is string"
        value={timeseriesFilter.isString}
        setValue={newValue =>
          setTimeseriesFilter({
            isString: newValue,
          })
        }
      />

      <AggregatedFilter
        items={items}
        aggregator="unit"
        title="Unit"
        value={timeseriesFilter.unit}
        setValue={newValue => setTimeseriesFilter({ unit: newValue })}
      />

      <MetadataFilter
        items={items}
        value={timeseriesFilter.metadata}
        setValue={newMetadata =>
          setTimeseriesFilter({
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
