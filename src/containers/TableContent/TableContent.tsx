import React from 'react';

import { Colors, Flex, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Tabs as AntdTabs } from 'antd';

import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';
import { useFullProfile } from 'hooks/profiling-service';
import { useIsTableEmpty } from 'hooks/table-data';
import { useActiveTableContext } from 'contexts';
import { useTranslation } from 'common/i18n';

const { TabPane } = AntdTabs;

const TableContent = () => {
  const { database, table, view, update } = useActiveTableContext();
  const { isFetching } = useFullProfile({ database, table });
  const isEmpty = useIsTableEmpty(database, table);

  return (
    <Wrapper>
      <StyledTabs
        key={`${database}_${table}`}
        onChange={(view) => update([database, table, view])}
        activeKey={view || 'spreadsheet'}
        renderTabBar={(props, TabBarComponent) => (
          <TopBar justifyContent="space-between" alignItems="center">
            <TableHeader title={database} subtitle={table} />
            <TabBarComponent {...props} />
          </TopBar>
        )}
      >
        <TabPane
          key="spreadsheet"
          tab={<TabSpreadsheet key={`${database}_${table}`} />}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </TabPane>

        <TabPane
          key="profiling"
          tab={<TabProfiling isFetching={isFetching} isEmpty={isEmpty} />}
          style={{ overflow: 'auto' }}
        >
          <Profiling key={`${database}_${table}`} />
        </TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

const TabSpreadsheet = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Tab>
      <Icon type="DataTable" />
      {t('tab-table')}
    </Tab>
  );
};

const TabProfiling = ({
  isFetching,
  isEmpty,
}: {
  isFetching: boolean;
  isEmpty: boolean;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Tab $isEmpty={isEmpty}>
      <Icon type={isFetching ? 'Loader' : 'Profiling'} />
      {t('tab-profile')}
    </Tab>
  );
};

const Wrapper = styled(Flex)`
  height: calc(100% - ${TAB_HEIGHT}px);
  width: 100%;
`;

const TopBar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;

const Tab = styled.span<{ $isEmpty?: boolean }>`
  display: inline-flex;
  align-content: center;
  line-height: 17px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ $isEmpty = false }) =>
    $isEmpty
      ? Colors['text-icon--interactive--disabled']
      : Colors['text-icon--medium']};
`;

const StyledTabs = styled(AntdTabs)`
  width: 100%;

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-nav {
    padding-left: 10px;
  }
`;
export default TableContent;
