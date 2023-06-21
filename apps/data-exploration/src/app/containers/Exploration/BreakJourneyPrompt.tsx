import React from 'react';

import { BreakJourneyModal } from '@data-exploration/components';

import { Button } from '@cognite/cogs.js';

import { usePushJourney } from '@data-exploration-app/hooks';
import {
  getSearchParamsWithJourney,
  getSearchParamsWithJourneyAndSelectedTab,
} from '@data-exploration-lib/core';

import { useBreakJourneyPromptState } from '../../hooks/detailsNavigation/useBreakJourneyPromptState';

export const BreakJourneyPrompt: React.FC<unknown> = () => {
  const [pushJourney] = usePushJourney();
  const [{ isOpen, journey }, setPromptOpen] = useBreakJourneyPromptState();

  const handlePromptToggle = (isPromptOpen: boolean) => {
    setPromptOpen(isPromptOpen);
  };

  return (
    <BreakJourneyModal
      visible={isOpen}
      hideFooter
      onCancel={() => {
        handlePromptToggle(false);
      }}
    >
      <div>You are about to end your current journey</div>
      <div style={{ display: 'flex', marginTop: '30px' }}>
        <Button
          type="ghost"
          alignVertically="left"
          onClick={() => handlePromptToggle(false)}
        >
          Cancel
        </Button>
        <div
          style={{
            marginLeft: 'auto',
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <Button
            type="secondary"
            onClick={() => {
              if (journey) {
                pushJourney(journey, true);
              }
              handlePromptToggle(false);
            }}
          >
            Overwrite current flow
          </Button>
          <Button
            icon="ArrowUpRight"
            type="primary"
            onClick={() => {
              if (journey) {
                const origin = window.location.origin;
                const pathname = window.location.pathname;
                const searchParams = journey.selectedTab
                  ? getSearchParamsWithJourneyAndSelectedTab(
                      journey,
                      journey.selectedTab
                    )
                  : getSearchParamsWithJourney(journey);
                const url = `${origin}${pathname}${searchParams}`;
                window.open(url, '_blank');
              }
              handlePromptToggle(false);
            }}
          >
            Open in new browser tab
          </Button>
        </div>
      </div>
    </BreakJourneyModal>
  );
};
