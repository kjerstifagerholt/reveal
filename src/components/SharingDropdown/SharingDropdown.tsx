import React from 'react';
import styled from 'styled-components/macro';
import {
  Button,
  Dropdown,
  Switch,
  Title,
  Menu,
  Body,
  toast,
} from '@cognite/cogs.js';
import { Chart } from 'reducers/charts';
import useDispatch from 'hooks/useDispatch';
import { toggleChartAccess } from 'reducers/charts/api';

interface SharingDropdownProps {
  chart: Chart;
}

const SharingDropdown = ({ chart }: SharingDropdownProps) => {
  const dispatch = useDispatch();
  const handleToggleChartAccess = async () => {
    try {
      await dispatch(toggleChartAccess(chart!));
    } catch (e) {
      toast.error('Unable to change chart access - try again!');
    }
  };

  return (
    <Dropdown
      content={
        <SharingMenu>
          <SharingMenuContent>
            <Title level={3}>{chart.name}</Title>
            <SharingMenuBody level={1}>
              {chart.public
                ? 'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.'
                : 'This is a private chart. It must be public to share it.'}
            </SharingMenuBody>
            <SharingSwitchContainer>
              <Switch
                name="toggleChartAccess"
                value={chart.public}
                onChange={handleToggleChartAccess}
              >
                {chart.public ? 'Sharing on' : 'Sharing off'}
              </Switch>
            </SharingSwitchContainer>
          </SharingMenuContent>
        </SharingMenu>
      }
    >
      <Button icon="Share" variant="ghost">
        Share
      </Button>
    </Dropdown>
  );
};

export const SharingMenu = styled(Menu)`
  min-width: 500px;
`;

export const SharingSwitchContainer = styled.div`
  margin: 16px 0 0 -8px;
`;

export const SharingMenuContent = styled.div`
  margin: 16px;
`;

export const SharingMenuBody = styled(Body)`
  margin: 8px 0 0;
  height: 40px;
`;

export default SharingDropdown;
