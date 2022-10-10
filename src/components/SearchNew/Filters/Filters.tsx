import React from 'react';

import {
  AssetFiltersV2,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from '.';

import {
  ResourceType,
  ResourceFilterProps,
  SetResourceFilterProps,
} from 'types';
import { FilterSection } from 'containers/SearchResults/SearchFiltersNew';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { CommonFilter } from './CommonFilter/CommonFilter';
import { CommonFilterFacets } from './types';
import { ResetFiltersButton } from './ResetFiltersButton';
import styled from 'styled-components';

export type FilterProps = Required<ResourceFilterProps> &
  SetResourceFilterProps & {
    resourceType: ResourceType;
    filterSection: FilterSection;
  };

export const Filters = ({
  filterSection,
  resourceType,
  assetFilter,
  setAssetFilter,
  timeseriesFilter,
  setTimeseriesFilter,
  sequenceFilter,
  setSequenceFilter,
  eventFilter,
  setEventFilter,
  fileFilter,
  setFileFilter,
  ...rest
}: FilterProps) => {
  // const commonFilter = React.useRef<CommonFilterFacets>({});
  const [commonFilter, setCommonFilter] = React.useState<CommonFilterFacets>(
    {}
  );

  // const hasFiltersApplied = assetFilter.
  if (filterSection === FilterSection.AppliedFilters) {
    return <p>Coming soon</p>;
  }

  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          <AssetFiltersV2
            filter={assetFilter}
            setFilter={setAssetFilter}
            {...rest}
          />
        );
      }
      case 'event': {
        return <EventFilters filter={eventFilter} setFilter={setEventFilter} />;
      }
      case 'timeSeries': {
        return (
          <TimeseriesFilters
            filter={timeseriesFilter}
            setFilter={setTimeseriesFilter}
          />
        );
      }
      case 'file': {
        return <FileFilters filter={fileFilter} setFilter={setFileFilter} />;
      }
      case 'sequence': {
        return (
          <SequenceFilters
            filter={sequenceFilter}
            setFilter={setSequenceFilter}
          />
        );
      }

      default: {
        return null;
      }
    }
  };

  const handleCommonChange = (updatingValue: CommonFilterFacets) => {
    setAssetFilter(prevState => ({ ...prevState, ...updatingValue }));
    setTimeseriesFilter(prevState => ({ ...prevState, ...updatingValue }));
    setFileFilter(prevState => ({ ...prevState, ...updatingValue }));
    setEventFilter(prevState => ({ ...prevState, ...updatingValue }));
    setSequenceFilter(prevState => ({ ...prevState, ...updatingValue }));

    setCommonFilter(prevFilter => ({ ...prevFilter, ...updatingValue }));
  };

  // This function (and the above) will be greatly simplified with the new filter structure (coming soon)
  const handleClearClick = () => {
    setAssetFilter({});
    setTimeseriesFilter({});
    setFileFilter({});
    setEventFilter({});
    setSequenceFilter({});

    setCommonFilter({});
  };

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilter
          resourceType={resourceType}
          commonFilter={commonFilter}
          onChange={handleCommonChange}
        />
        {renderCustomResourceTypeFilter()}
      </BaseFilterCollapse>
      <ResetFiltersButton setFilter={handleClearClick} />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: scroll;
  padding-right: 16px;
`;
