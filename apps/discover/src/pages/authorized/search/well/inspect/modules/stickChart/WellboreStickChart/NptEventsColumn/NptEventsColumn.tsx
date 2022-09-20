import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { filterNptEventsByCodeSelection } from 'domain/wells/npt/internal/selectors/filterNptEventsByCodeSelection';
import {
  NptCodesSelection,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';
import { isAnyNptMissingTvd } from 'domain/wells/npt/internal/utils/isAnyNptMissingTvd';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NPT_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NptEventsBadge from '../../../common/Events/NptEventsBadge';
import {
  NptEventsByDepth,
  EMPTY_STATE_TEXT,
} from '../../../common/Events/NptEventsByDepth';
import { EventsColumnView } from '../../../common/Events/types';
import { ColumnNotification } from '../../components/ColumnNotification';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { DetailPageOption } from '../../components/DetailPageOption';
import { ColumnVisibilityProps } from '../../types';
import {
  DEFAULT_EVENTS_COLUMN_VIEW,
  EVENTS_COLUMN_WIDTH,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
  SOME_EVENT_MISSING_TVD_TEXT,
} from '../constants';
import { EventsColumnBody } from '../elements';

import { NptEventsScatterView } from './components/NptEventsScatterView';

export interface NptEventsColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  data?: NptInternalWithTvd[];
  isLoading?: boolean;
  nptCodesSelecton?: NptCodesSelection;
  depthMeasurementType?: DepthMeasurementUnit;
  onClickDetailsButton?: () => void;
}

export const NptEventsColumn: React.FC<
  WithDragHandleProps<NptEventsColumnProps>
> = React.memo(
  ({
    scaleBlocks,
    data = EMPTY_ARRAY,
    isLoading,
    nptCodesSelecton,
    depthMeasurementType,
    isVisible = true,
    onClickDetailsButton = noop,
    ...dragHandleProps
  }) => {
    const { nptCodeDefinitions } = useNptDefinitions();

    const [view, setView] = useState(DEFAULT_EVENTS_COLUMN_VIEW);
    const [expandedScaleBlock, setExpandedScaleBlock] =
      useState<[number, number]>();

    const filteredData = useDeepMemo(() => {
      if (!nptCodesSelecton) {
        return data;
      }
      return filterNptEventsByCodeSelection(data, nptCodesSelecton);
    }, [data, nptCodesSelecton]);

    const emptySubtitle = useDeepMemo(() => {
      if (nptCodesSelecton && isEmpty(nptCodesSelecton)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(data) && isEmpty(filteredData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return EMPTY_STATE_TEXT;
    }, [data, filteredData]);

    const renderBlockEvents = (
      data: NptInternalWithTvd[],
      scaleBlockRange: [number, number]
    ) => {
      if (isEmpty(data)) {
        return null;
      }

      if (view === EventsColumnView.Scatter) {
        return (
          <NptEventsScatterView
            events={data}
            nptCodeDefinitions={nptCodeDefinitions}
            depthMeasurementType={depthMeasurementType}
            scaleBlockRange={scaleBlockRange}
            expandedScaleBlock={expandedScaleBlock}
            onExpandOverflowEvents={setExpandedScaleBlock}
          />
        );
      }

      return <NptEventsBadge events={data} />;
    };

    return (
      <NoUnmountShowHide show={isVisible}>
        <BodyColumn width={EVENTS_COLUMN_WIDTH} data-testid="nptEvents-column">
          <ColumnDragger {...dragHandleProps} />

          <ColumnHeaderWrapper>
            <ColumnOptionsSelector
              options={Object.values(EventsColumnView)}
              selectedOption={view}
              displayValue={NPT_COLUMN_TITLE}
              onChange={setView}
              Footer={<DetailPageOption onClick={onClickDetailsButton} />}
            />
          </ColumnHeaderWrapper>

          <EventsColumnBody>
            <ColumnNotification
              content={SOME_EVENT_MISSING_TVD_TEXT}
              visible={
                depthMeasurementType === DepthMeasurementUnit.TVD &&
                isAnyNptMissingTvd(filteredData)
              }
            />

            <NptEventsByDepth
              scaleBlocks={scaleBlocks}
              events={filteredData}
              isLoading={isLoading}
              emptySubtitle={emptySubtitle}
              depthMeasurementType={depthMeasurementType}
              renderBlockEvents={renderBlockEvents}
            />
          </EventsColumnBody>
        </BodyColumn>
      </NoUnmountShowHide>
    );
  }
);
