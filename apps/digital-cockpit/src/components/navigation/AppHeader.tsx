import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Icon, TopBar, Menu, Tooltip, Graphic } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { AuthProvider } from '@cognite/react-container';
import {
  getGroupsState,
  getUsersGroupNames,
  isAdmin,
} from 'store/groups/selectors';
import { CustomMenuItem, CustomMenuLink } from 'styles/common';
import { useLink, usePossibleTenant } from 'hooks';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { clearGroupsFilter, setGroupsFilter } from 'store/groups/actions';
import { useHistory } from 'react-router-dom';
import { useMetrics } from 'utils/metrics';
import { modalOpen } from 'store/modals/actions';
import { getConfigState } from 'store/config/selectors';
import { addConfigItems } from 'store/config/actions';
import useHelpCenter from 'hooks/useHelpCenter';

import { fetchCustomerLogoUrl } from '../../store/thunks';

import CustomerLogo from './CustomerLogo';
import {
  GroupPreview,
  LogoWrapper,
  GroupItemWrapper,
  AppHeaderWrapper,
} from './elements';
import UserMenu from './UserMenu';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector(isAdmin);
  const { authState } = useContext(AuthProvider);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const history = useHistory();
  const metrics = useMetrics('AppHeader');
  const { customerLogoFetched } = useSelector(getConfigState);
  const allGroupNames = useSelector(getUsersGroupNames);
  const tenant = usePossibleTenant();

  const client = useContext(CdfClientContext);

  const [customerLogoUrl, setCustomerLogoUrl] = useState('');
  const { toggleHelpCenter } = useHelpCenter();

  const { documentTitle, accessManageLink } = useLink();

  const isNoc = () => {
    return (
      tenant === 'noc' || tenant === 'noc-test' || tenant === 'noc-pre-prod'
    );
  };

  const setFilter = (groupName: string) => {
    const alreadyChecked = groupsFilter.includes(groupName);
    if (alreadyChecked) {
      dispatch(clearGroupsFilter());
      metrics.track('GroupMenu_UnselectGroup', { groupName });
    } else {
      dispatch(setGroupsFilter([groupName]));
      metrics.track('GroupMenu_SelectGroup', { groupName });
    }
  };

  const clearGroupFilter = () => {
    metrics.track('ClearGroupFilter');
    dispatch(clearGroupsFilter());
  };

  const goHome = () => {
    metrics.track('CustomerLogo_Click');
    history.push('/');
  };

  useEffect(() => {
    if (!customerLogoFetched) {
      dispatch(fetchCustomerLogoUrl(client, setCustomerLogoUrl));
      dispatch(addConfigItems({ customerLogoFetched: true }));
    }
  }, [customerLogoFetched, dispatch, client]);

  const openUploadLogoModal = () => {
    dispatch(modalOpen({ modalType: 'UploadLogo' }));
  };

  const openAppConfigModal = () => {
    dispatch(modalOpen({ modalType: 'AppConfig' }));
  };

  if (!customerLogoFetched) {
    return null;
  }

  const adminActions = [
    {
      key: 'view',
      component: (
        <Tooltip content="View what other groups has access to">
          <Icon
            type="Users"
            data-testid="select-group-preview-menu"
            onClick={() => metrics.track('GroupMenu_Click')}
          />
        </Tooltip>
      ),
      menu: (
        <Menu className="app-header-groups-list-menu">
          <Menu.Header>Select Group Access to View</Menu.Header>
          <GroupItemWrapper>
            {allGroupNames.map((groupName) => (
              <Menu.Item
                selected={groupsFilter.includes(groupName)}
                key={groupName}
              >
                <CustomMenuItem
                  onClick={() => setFilter(groupName)}
                  onKeyPress={() => setFilter(groupName)}
                  data-testid={`menu-item-${groupName}`}
                >
                  {groupName}
                </CustomMenuItem>
                {groupsFilter.includes(groupName) && <Icon type="Checkmark" />}
              </Menu.Item>
            ))}
          </GroupItemWrapper>
          <Menu.Divider />
          <Menu.Header>Edit Access Groups</Menu.Header>
          <Menu.Item
            key="cogniteDataFusion"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <CustomMenuLink
              href={accessManageLink}
              key="cdf-link"
              target="_blank"
            >
              Cognite Data Fusion
            </CustomMenuLink>
            <Icon type="ExternalLink" />
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  const actions = [
    {
      key: 'help',
      onClick: toggleHelpCenter,
      component: <Icon type="Help" />,
    },
    {
      key: 'user',
      component: (
        <Avatar
          text={authState?.email || ''}
          onClick={() => metrics.track('ProfileMenu_Click')}
        />
      ),
      menu: (
        <UserMenu
          email={authState?.email || ''}
          client={client}
          openUploadLogoModal={openUploadLogoModal}
          openAppConfigModal={openAppConfigModal}
          isAdmin={admin}
        />
      ),
    },
  ];

  if (isNoc()) {
    actions.push({
      key: 'NOCDTlogo',
      component: <Graphic type="NOC" />,
      onClick: goHome,
    });
  }

  const filteredActions = admin ? [...adminActions, ...actions] : actions;

  return (
    <AppHeaderWrapper>
      {!!groupsFilter?.length && (
        <GroupPreview data-testid="user-group-preview-bar">
          <TopBar>
            <TopBar.Left>
              <TopBar.Logo
                title={groupsFilter.join(', ')}
                logo={
                  <Icon type="Users" style={{ margin: '6px 8px 0 12px' }} />
                }
              />
            </TopBar.Left>
            <TopBar.Right>
              <TopBar.Action
                icon="Close"
                text="Clear view"
                onClick={clearGroupFilter}
              />
            </TopBar.Right>
          </TopBar>
        </GroupPreview>
      )}
      <TopBar>
        <TopBar.Left>
          <TopBar.Logo
            title={`Cognite ${documentTitle}`}
            logo={
              <Graphic
                type="Cognite"
                style={{
                  width: 42,
                  margin: '4px 12px 0 12px',
                  cursor: 'pointer',
                }}
                className="topbar-logo"
                onClick={goHome}
              />
            }
            subtitle={
              <span style={{ textTransform: 'capitalize' }}>{tenant}</span>
            }
            onLogoClick={goHome}
          />
        </TopBar.Left>
        <TopBar.Right>
          {!isNoc() && (
            <TopBar.Item className="topbar-logo-wrapper">
              <LogoWrapper>
                <TopBar.Logo
                  onLogoClick={goHome}
                  logo={<CustomerLogo imgUrl={customerLogoUrl} />}
                />
              </LogoWrapper>
            </TopBar.Item>
          )}
          <TopBar.Actions actions={filteredActions} />
        </TopBar.Right>
      </TopBar>
    </AppHeaderWrapper>
  );
};

export default AppHeader;
