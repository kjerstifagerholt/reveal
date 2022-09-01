import React, { useCallback, useState } from 'react';

import { LoadingOverlay } from 'components/Loading';
import { MultiStateToggle } from 'components/MultiStateToggle';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';
import { ViewModes } from 'pages/authorized/search/common/types';

import { Separator } from '../../elements';

import { DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NptEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NptGraph, SelectedWellboreNptView } from './Graph';
import { NptTable } from './Table';

export const NptEvents: React.FC = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const [activeViewMode, setActiveViewMode] = useState<ViewModes>(
    DEFAULT_ACTIVE_VIEW_MODE
  );

  const [nptGraphSelectedWellboreId, setNptGraphSelectedWellboreId] =
    useState<string>();
  const [selectedWellboreViewLoading, setSelectedWellboreViewLoading] =
    useState<boolean>(false);

  const handleSelectNptGraphBar = useCallback((selectedWellboreId?: string) => {
    setSelectedWellboreViewLoading(true);
    setTimeout(() => {
      setNptGraphSelectedWellboreId(selectedWellboreId);
      setTimeout(() => setSelectedWellboreViewLoading(false));
    });
  }, []);

  const handleCloseWellboreDetailView = () => {
    setNptGraphSelectedWellboreId(undefined);
  };

  const isGraphViewModeActive = activeViewMode === ViewModes.Graph;
  const isTableViewModeActive = activeViewMode === ViewModes.Table;

  return (
    <>
      <NptEventsDataControlArea>
        <MultiStateToggle<ViewModes>
          activeOption={activeViewMode}
          options={ViewModes}
          onChange={setActiveViewMode}
        />

        {isTableViewModeActive && <Separator />}

        <FilterContainer isVisible={isTableViewModeActive} />
      </NptEventsDataControlArea>

      <NoUnmountShowHide show={isGraphViewModeActive}>
        <NptGraph onSelectBar={handleSelectNptGraphBar} />
      </NoUnmountShowHide>

      <NoUnmountShowHide show={isTableViewModeActive}>
        <NptTable />
      </NoUnmountShowHide>

      <SelectedWellboreNptView
        selectedWellboreId={nptGraphSelectedWellboreId}
        wellboreIdsToNavigate={wellboreIds}
        onCloseSelectedWellboreNptViewClick={handleCloseWellboreDetailView}
      />

      {selectedWellboreViewLoading && <LoadingOverlay />}
    </>
  );
};

export default NptEvents;
