import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { SequenceInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import {
  SequencePreview as SequenceTabPreview,
  ErrorFeedback,
} from '@cognite/data-exploration';
import { CogniteError, Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

export type SequencePreviewType =
  | 'details'
  | 'columns'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const SequencePreview = ({
  sequenceId,
  actions,
}: {
  sequenceId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: SequencePreviewType;
  }>();
  const activeTab = tabType || 'preview';

  const onTabChange = useOnPreviewTabChange(tabType, 'sequence');
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Sequence', { sequenceId });
  }, [sequenceId]);

  const {
    data: sequence,
    isFetched,
    error,
  } = useCdfItem<Sequence>('sequences', { id: sequenceId });

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!sequence) {
    return <>Sequence {sequenceId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs
        currentResource={{
          title: sequence.name || sequence.externalId || String(sequence.id),
        }}
      />
      <ResourceTitleRow
        item={{ id: sequenceId, type: 'sequence' }}
        title={sequence.name}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'sequence',
          id: sequence.id,
          externalId: sequence.externalId,
          title: sequence.name || sequence.externalId || String(sequence.id),
        }}
        onTabChange={onTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab label="Preview" tabKey="preview" key="preview">
            <SequenceTabPreview sequence={sequence} />
          </Tabs.Tab>,
          <Tabs.Tab label="Details" tabKey="details" key="details">
            <DetailsTabWrapper>
              <SequenceInfo sequence={sequence} />
              <Metadata metadata={sequence.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
