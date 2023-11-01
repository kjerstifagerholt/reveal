import React, { PropsWithChildren } from 'react';

import { useProjectConfig } from '@fdx/shared/hooks/useConfig';
import { useSelectedSiteLocalStorage } from '@fdx/shared/hooks/useLocalStorage';
import isEmpty from 'lodash/isEmpty';

import { Dropdown, Flex, Menu, useBoolean, Chip } from '@cognite/cogs.js';

export const SiteSelection: React.FC<PropsWithChildren> = ({ children }) => {
  const config = useProjectConfig();
  const { value, toggle, setFalse } = useBoolean(false);

  const [, setSelectedSite] = useSelectedSiteLocalStorage();

  if (isEmpty(config?.sites) && !config?.showCustomSite) {
    return null;
  }

  return (
    <Dropdown
      visible={value}
      onClickOutside={setFalse}
      content={
        <Menu style={{ width: 288 }} data-testid="site-selection-menu">
          <Menu.Section label="Sites">
            <React.Fragment>
              {config?.sites?.map((site) => (
                <Menu.Item
                  onClick={() => setSelectedSite(site.name)}
                  key={site.name}
                >
                  {site.name}
                </Menu.Item>
              ))}
              {config?.showCustomSite && (
                <Menu.Item onClick={() => setSelectedSite('Custom')}>
                  Custom <Chip label="Development" size="x-small" />
                </Menu.Item>
              )}
            </React.Fragment>
          </Menu.Section>
        </Menu>
      }
    >
      <Flex
        alignItems="center"
        className="orientation-site-selection"
        onClick={() => toggle()}
      >
        {children}
      </Flex>
    </Dropdown>
  );
};
