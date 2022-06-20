import { getEmptyNdsAggregatesMerged } from 'domain/wells/nds/internal/utils/getEmptyNdsAggregatesMerged';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { mergeUniqueArray } from 'utils/merge';

import EmptyState from 'components/EmptyState';
import { useDeepMemo } from 'hooks/useDeep';

import { ViewModeControl } from '../common/ViewModeControl';

import { DetailedView } from './components/DetailedView';
import { Filters } from './components/Filters';
import { NdsTreemap } from './components/NdsTreemap';
import { NdsTable } from './components/Table';
import { EMPTY_APPLIED_FILTERS, NdsViewModes } from './constants';
import { FiltersBar } from './elements';
import { AppliedFilters, FilterValues, NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';
import { getFilteredNdsData } from './utils/getFilteredNdsData';
import { getNdsAggregateForWellbore } from './utils/getNdsAggregateForWellbore';

const NdsEvents: React.FC = () => {
  // data
  const { isLoading, data, ndsAggregates } = useNdsData();
  const wellbores = useWellInspectSelectedWellbores();

  // state
  const [selectedWellboreIndex, setSelectedWellboreIndex] = useState<
    number | undefined
  >(undefined);

  const [selectedWellboreId, setSelectedWellboreId] = useState<
    string | undefined
  >(undefined);

  const [filteredData, setFilteredData] = useState<NdsView[]>(data);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(
    EMPTY_APPLIED_FILTERS
  );
  const [selectedViewMode, setSelectedViewMode] = useState<NdsViewModes>(
    NdsViewModes.Treemap
  );
  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>([]);

  const treemapData = useMemo(
    () => generateNdsTreemapData(wellbores, filteredData),
    [wellbores, filteredData]
  );

  const filtersData = useDeepMemo(
    () =>
      Object.values(ndsAggregates).reduce(
        mergeUniqueArray,
        getEmptyNdsAggregatesMerged()
      ),
    [ndsAggregates]
  );

  const detailedViewNdsAggregate = useMemo(
    () => getNdsAggregateForWellbore(detailedViewNdsData || [], ndsAggregates),
    [detailedViewNdsData]
  );

  useEffect(() => {
    setSelectedWellboreIndex(
      wellbores.findIndex(
        (wellbore) => wellbore.matchingId === selectedWellboreId
      )
    );

    setDetailedViewNdsData(
      selectedWellboreId
        ? data.filter(
            (ndsEvent) => ndsEvent.wellboreMatchingId === selectedWellboreId
          )
        : []
    );
  }, [selectedWellboreId]);

  const handleChangeFilter = (
    filter: keyof AppliedFilters,
    values: FilterValues
  ) => {
    setAppliedFilters((appliedFilters) => ({
      ...appliedFilters,
      [filter]: values,
    }));
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    const filteredData = getFilteredNdsData(data, appliedFilters);
    setFilteredData(filteredData);
  }, [appliedFilters]);

  useEffect(() => {
    const { riskTypesAndSubtypes, severities, probabilities } = filtersData;

    setAppliedFilters({
      riskType: riskTypesAndSubtypes,
      severity: severities,
      probability: probabilities,
    });
  }, [data, filtersData]);

  const handlePreviousClick = () => {
    const wellboreId = wellbores[(selectedWellboreIndex || 0) - 1]?.matchingId;
    if (wellboreId) {
      setSelectedWellboreId(wellboreId);
    }
  };

  const handleNextClick = () => {
    const wellboreId = wellbores[(selectedWellboreIndex || 0) + 1]?.matchingId;
    if (wellboreId) {
      setSelectedWellboreId(wellboreId);
    }
  };

  return (
    <>
      <FiltersBar>
        <ViewModeControl
          views={Object.values(NdsViewModes)}
          selectedView={selectedViewMode}
          onChangeView={setSelectedViewMode}
        />

        <Filters
          {...filtersData}
          appliedFilters={appliedFilters}
          onChangeFilter={handleChangeFilter}
        />
      </FiltersBar>

      {(isEmpty(data) || isEmpty(filteredData)) && (
        <EmptyState isLoading={isLoading} />
      )}

      {!isEmpty(filteredData) && selectedViewMode === NdsViewModes.Treemap && (
        <NdsTreemap
          data={treemapData}
          tileCursor="pointer"
          onClickTile={(wellboreId) => {
            setSelectedWellboreId(wellboreId);
          }}
        />
      )}

      {!isEmpty(filteredData) && selectedViewMode === NdsViewModes.Table && (
        <NdsTable data={filteredData} onClickView={setDetailedViewNdsData} />
      )}

      <DetailedView
        data={detailedViewNdsData}
        ndsAggregate={detailedViewNdsAggregate}
        isPreviousButtonDisabled={selectedWellboreIndex === 0}
        isNextButtonDisabled={selectedWellboreIndex === wellbores.length - 1}
        onBackClick={() => setSelectedWellboreId(undefined)}
        onPreviousClick={handlePreviousClick}
        onNextClick={handleNextClick}
      />
    </>
  );
};

export default NdsEvents;
