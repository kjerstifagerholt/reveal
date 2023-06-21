import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { EventInfo } from '@data-exploration/containers';

import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRowV2 from '@data-exploration-app/components/ResourceTitleRowV2';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabsV2 } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { renderTitle } from '@data-exploration-app/utils/EventsUtils';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { SUB_APP_PATH, createInternalLink } from '@data-exploration-lib/core';

// EventPreviewTabType;
// - details
// - assets
// - timeseries
// - files
// - sequences
// - events

export const EventDetail = ({
  eventId,
  actions,
}: {
  eventId: number;
  actions?: React.ReactNode;
}) => {
  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab || 'details';

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Event', { eventId });
  }, [eventId]);

  const {
    data: event,
    error,
    isFetched: isEventFetched,
  } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  useEffect(() => {
    if (isEventFetched && event) {
      // save Event preview as view resource in user history
      if (event?.id)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: renderTitle(event),
          path: createInternalLink(pathname, searchParams),
        });
    }
  }, [isEventFetched, event]);

  if (!eventId || !Number.isFinite(eventId)) {
    return <>Invalid event id: {eventId}</>;
  }

  if (!isEventFetched) {
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

  if (!event) {
    return <>Event {eventId} not found!</>;
  }

  return (
    <>
      <BreadcrumbsV2 />
      <ResourceTitleRowV2
        item={{ id: eventId, type: 'event' }}
        title={renderTitle(event)}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabsV2
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
          title: renderTitle(event),
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab key="details" label="Details" tabKey="details">
            <DetailsTabWrapper>
              <EventInfo event={event} />
              <Metadata metadata={event.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
