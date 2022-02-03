import React, { useState, useEffect } from 'react';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

import Skeleton from 'components/skeleton';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  useClearWellsFilters,
  useSetWellsFiltersAsync,
} from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { Modules } from 'modules/sidebar/types';
import { FIELD_BLOCK_OPERATOR } from 'modules/wellSearch/constantsSidebarFilters';
import { useFilterConfigByCategory } from 'modules/wellSearch/hooks/useFilterConfigByCategory';
import { useWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';
import {
  WellFilterOptionValue,
  WellFilterMap,
  FilterConfig,
} from 'modules/wellSearch/types';

import { BaseFilter } from '../../components/BaseFilter';
import { FilterCollapse } from '../../components/FilterCollapse';
import Header from '../common/Header';

import { Operator } from './categories/Operator';
import { RegionFieldBlock } from './categories/RegionFieldBlock';
import { CommonFilter } from './CommonFilter';
import { TITLE, CATEGORY } from './constants';
import { Title } from './Title';

const loader = <Skeleton.List lines={6} borders />;

export const WellsFilter = () => {
  const { isFetching, data: filterOptions } = useWellFilterOptions();
  const [selectedOptions, setSelectedOptions] = useState<WellFilterMap>({});
  // const [changedCategories, setChangedCategories] = useState<SelectedMap>({});
  const [filterCalled, setFilterCalled] = useState<boolean>(false);
  const filters = useAppliedWellFilters();
  const setWellsFilters = useSetWellsFiltersAsync();
  const clearWellFilters = useClearWellsFilters();

  const filterConfigsByCategory = useFilterConfigByCategory();
  const metrics = useGlobalMetrics('search');

  useEffect(() => {
    /**
     * Trick to avoid updating the selected options state when updating the filter state from this Filter Panel.
     * But selected options state will update when the filter state update externally.
     */
    if (filterCalled) {
      setFilterCalled(false);
    } else {
      // setChangedCategories({});
      setSelectedOptions(filters);
    }
  }, [filters]);

  const onValueChange = (
    _filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[],
    filterGroupName: string
  ) => {
    setSelectedOptions({
      ...selectedOptions,
      [id]: selectedVals,
    });
    // console.log('selectedOptions', selectedOptions);

    setFilterCalled(true);
    metrics.track('click-sidebar-wells-filter', {
      filter: filterGroupName,
      value: selectedVals,
    });

    const filtersToApply = isEmpty(selectedVals)
      ? omit(filters, id)
      : { ...filters, ...{ [id]: selectedVals } };

    setWellsFilters(filtersToApply);
  };

  const handleClear = (changes: Record<number, WellFilterOptionValue[]>) => {
    setSelectedOptions({
      ...selectedOptions,
      ...changes,
    });

    const filtersToApply = { ...filters, ...changes };
    setWellsFilters(filtersToApply);
  };

  // eg: "Well Characteristics"
  const WellFilters: React.FC<{
    filterConfigs: FilterConfig[];
    index: number;
  }> = ({ filterConfigs, index }) => {
    return React.useMemo(
      () => (
        <>
          {filterConfigs.map((filterConfig) => {
            return (
              <CommonFilter
                key={filterConfig.id}
                filterConfig={filterConfig}
                onValueChange={(
                  id: number,
                  selectedVals: WellFilterOptionValue[]
                ) => onValueChange(index, id, selectedVals, filterConfig.name)}
                options={get(filterOptions, filterConfig.id, [])}
                selectedOptions={selectedOptions[filterConfig.id]}
                displayFilterTitle={filterConfigs.length > 1}
              />
            );
          })}
        </>
      ),
      [filterConfigs, index]
    );
  };

  const renderFilters = React.useMemo(() => {
    if (isFetching) {
      return loader;
    }

    return (
      <>
        {filterConfigsByCategory.map((category, index) => {
          const hasCustomRegion = category.title === FIELD_BLOCK_OPERATOR;

          return (
            <FilterCollapse.Panel
              title={category.title}
              // showApplyButton={changedCategories[index]}
              // handleApplyClick={() => applyFilters(index)}
              key={category.title}
              headerTestId={category.title}
            >
              {/* 
              something pretty strange is going on with FilterCollapse.Panel
              had some trouble getting this to render properly when using it in a different place...
              using this index overwride for now, but if you can work it out, it would be better to just 
              render RegionFieldBlock in it's owner FilterCollapse above this
               */}
              {hasCustomRegion && (
                <>
                  <RegionFieldBlock
                    key="filter-category-RegionFieldBlock"
                    regionFieldBlockConfig={category.filterConfigs}
                    onValueChange={onValueChange}
                    selectedOptions={selectedOptions}
                    handleClear={handleClear}
                  />
                  <Operator
                    key="filter-category-Operator"
                    allConfig={category.filterConfigs}
                    onValueChange={onValueChange}
                    selectedOptions={selectedOptions}
                  />
                </>
              )}

              {/* Filter Elements */}
              {!hasCustomRegion && (
                <WellFilters
                  filterConfigs={category.filterConfigs}
                  index={index}
                />
              )}
            </FilterCollapse.Panel>
          );
        })}
      </>
    );
  }, [
    isFetching,
    filterConfigsByCategory,
    selectedOptions,
    filters,
    filterOptions,
    onValueChange,
    RegionFieldBlock,
  ]);

  return (
    <BaseFilter>
      <Header
        title={TITLE}
        category={CATEGORY}
        handleClearFilters={clearWellFilters}
      />
      <FilterCollapse category={Modules.WELLS}>
        {/* Collapsable Panel Elements */}
        {renderFilters}
      </FilterCollapse>
    </BaseFilter>
  );
};

WellsFilter.Title = Title;
