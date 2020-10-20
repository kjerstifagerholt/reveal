import React, { useMemo } from 'react';
import { Timeseries } from '@cognite/sdk';
import { ErrorFeedback, Loader } from 'lib/components';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { TimeseriesDetailsAbstract } from 'lib/containers/Timeseries';

export const TimeseriesSmallPreview = ({
  timeseriesId,
  actions: propActions,
  extras,
  children,
}: {
  timeseriesId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'timeSeries',
    id: timeseriesId,
  });

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: timeseriesId,
        type: 'timeSeries',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, timeseriesId, propActions]);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Time series {timeseriesId} not found!</>;
  }

  return (
    <TimeseriesDetailsAbstract
      key={timeseries.id}
      timeSeries={timeseries}
      extras={extras}
      actions={actions}
    >
      {children}
    </TimeseriesDetailsAbstract>
  );
};
