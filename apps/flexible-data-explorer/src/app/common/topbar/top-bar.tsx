import { TopBar as CogsTopBar } from '@cognite/cogs.js';
import type { FC } from 'react';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const TopBar: FC<Props> = ({ tenant }) => {
  return (
    <CogsTopBar>
      <CogsTopBar.Left>
        <CogsTopBar.Logo title="Cognite" />

        <CogsTopBar.Navigation
          links={[
            {
              name: 'Explore',
            },
          ]}
        />
      </CogsTopBar.Left>

      <CogsTopBar.Right>
        <CogsTopBar.AppSwitcher
          data-testid="topbar_app_switcher"
          tenant={tenant}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
