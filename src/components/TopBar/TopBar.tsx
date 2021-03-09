import React from 'react';
import { Avatar, Menu, TopBar } from '@cognite/cogs.js';
import sidecar from 'config/sidecar';

import logoSvg from 'assets/logo.svg';
import useSelector from 'hooks/useSelector';
import { selectUser } from 'reducers/environment';
import { useHistory } from 'react-router-dom';

const TopBarWrapper = () => {
  const user = useSelector(selectUser);
  const history = useHistory();

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Cognite Charts"
          onLogoClick={() =>
            history.location.pathname !== '/' && history.push('/')
          }
          logo={
            <img
              src={logoSvg}
              alt="Cognite Charts Logo"
              style={{ margin: '0 12px 0 16px' }}
            />
          }
        />
        <TopBar.Navigation links={[]} />
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Actions
          actions={[
            {
              key: 'help',
              icon: 'Help',
              name: 'Help',
              menu: (
                <Menu>
                  <Menu.Item
                    onClick={() => window.open(sidecar.privacyPolicyUrl)}
                  >
                    Privacy policy
                  </Menu.Item>
                  <Menu.Footer>
                    v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                  </Menu.Footer>
                </Menu>
              ),
            },
            {
              key: 'avatar',
              component: <Avatar text={user.email || 'Unknown'} />,
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
};

export default TopBarWrapper;
