import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Colors, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import IntegrationDetails from 'components/modals/IntegrationDetails';
import { useQueryCache } from 'react-query';
import { Integration } from '../../model/Integration';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useIntegrationById } from '../../hooks/useIntegration';

const TableOptionDropdown = styled((props) => (
  <Dropdown {...props}>{props.children}</Dropdown>
))`
  .tippy-content {
    padding: 0;
    .cogs-menu-item {
      color: ${Colors.black.hex()};
    }
  }
`;
const OptionMenuBtn = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  background-color: transparent;
  color: ${Colors.black.hex()};
  :hover {
    background-color: transparent;
    box-shadow: none;
  }
  .cogs-icon {
    svg {
      width: inherit;
    }
  }
`;

export enum IntegrationAction {
  VIEW_EDIT_DETAILS = 'View/edit integration',
}

interface OwnProps {
  integration: Integration;
}

type Props = OwnProps;

const IntegrationsTableActions: FunctionComponent<Props> = ({
  integration,
}: Props) => {
  const [integrationDetailVisible, setIntegrationDetailVisible] = useState(
    false
  );
  const queryCache = useQueryCache();
  const { project } = useAppEnv();

  const { data: singleIntegration } = useIntegrationById(integration.id);
  const [display, setDisplay] = useState(integration);
  useEffect(() => {
    if (singleIntegration) {
      setDisplay((old) => {
        return { ...old, ...singleIntegration };
      });
    }
  }, [singleIntegration]);

  const openIntegrationDetails = () => {
    setIntegrationDetailVisible(true);
  };
  const onIntegrationDetailsCancel = () => {
    queryCache.invalidateQueries(['integrations', project]);
    setIntegrationDetailVisible(false);
  };

  return (
    <>
      <TableOptionDropdown
        content={
          <Menu>
            <Menu.Header>Actions</Menu.Header>
            <Menu.Item key="0" onClick={openIntegrationDetails}>
              {IntegrationAction.VIEW_EDIT_DETAILS}
            </Menu.Item>
          </Menu>
        }
      >
        <OptionMenuBtn aria-label={`Actions for ${display.name}`}>
          <Icon type="VerticalEllipsis" />
        </OptionMenuBtn>
      </TableOptionDropdown>
      <IntegrationDetails
        onCancel={onIntegrationDetailsCancel}
        visible={integrationDetailVisible}
        integration={display}
      />
    </>
  );
};

export default IntegrationsTableActions;
