import { useState } from 'react';
import { useMatchRoute, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { TopBar } from '@cognite/cogs.js';

import { SimulatorStatus } from 'components/simulator/SimulatorStatus';
import { selectCapabilities } from 'store/capabilities/selectors';
import { createCdfLink } from 'utils/createCdfLink';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import { LabelsModal } from './LabelsModal';

export function MenuBar() {
  const capabilities = useSelector(selectCapabilities);
  const [isOpen, setOpen] = useState<boolean>(false);
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const labelsFeature = capabilities.capabilities?.find(
    (feature) => feature.name === 'Labels'
  );
  const isLabelsEnabled = labelsFeature?.capabilities?.every(
    (capability) => capability.enabled
  );

  return (
    <TopBar data-cy="top-bar">
      {isLabelsEnabled && <LabelsModal isOpen={isOpen} setOpen={setOpen} />}
      <TopBar.Left>
        <TopBar.Navigation
          links={[
            {
              name: 'Model library',
              isActive: !!matchRoute({
                to: createCdfLink('/model-library'),
                fuzzy: true,
              }),
              onClick: () => {
                navigate({
                  to: createCdfLink('/model-library'),
                });
              },
            },
            {
              name: 'Run browser',
              isActive: !!matchRoute({
                to: createCdfLink('/calculations/runs'),
                fuzzy: true,
              }),
              onClick: () => {
                trackUsage(TRACKING_EVENTS.RUN_BROWSER_VIEW, {});
                navigate({
                  to: createCdfLink('/calculations/runs'),
                });
              },
            },
          ]}
        />
      </TopBar.Left>
      <TopBar.Right>
        <div className="cogs-topbar--item" style={{ padding: '0 24px' }}>
          <SimulatorStatus />
        </div>
      </TopBar.Right>
    </TopBar>
  );
}
