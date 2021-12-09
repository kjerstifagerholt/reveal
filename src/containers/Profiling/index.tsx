import React, { useMemo, useState } from 'react';

import { Flex, Loader, Title, Colors } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { sortBy } from 'lodash';
import { AutoResizer } from 'react-base-table';
import styled from 'styled-components';

import { useActiveTableContext } from 'contexts';
import { useFilteredColumns } from 'hooks/table-filters';
import {
  ColumnProfile,
  useQuickProfile,
  useFullProfile,
  FULL_PROFILE_LIMIT,
  useColumnType,
} from 'hooks/profiling-service';

import { FilterBar } from 'containers/Spreadsheet/FilterBar';
import ProfileRow from './ProfileRow';
import ProfileTableHeader from './ProfileTableHeader';
import ProfileCoverageLabel, {
  ProfileResultType,
} from './ProfileCoverageLabel';
import ProfileStatusMessage from './ProfileStatusMessage';

export type SortableColumn = keyof ColumnProfile;

export const Profiling = (): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const { isFetched: areTypesFetched } = useColumnType(database, table);

  const fullProfile = useFullProfile({
    database,
    table,
  });

  const limitProfile = useQuickProfile({
    database,
    table,
  });

  const {
    data = { columns: [], rowCount: 0 },
    isLoading,
    isError,
    error,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const [sortKey, _setSortKey] = useState<SortableColumn>('label');
  const [sortReversed, _setSortReversed] = useState(false);

  let profileResultType: ProfileResultType = 'running';
  if (fullProfile.data?.rowCount === FULL_PROFILE_LIMIT) {
    profileResultType = 'partial';
  } else if (fullProfile.isFetched) {
    profileResultType = 'complete';
  }

  const setSortKey = (key: SortableColumn) => {
    const reverse = sortKey === key;
    _setSortKey(key);
    if (reverse) {
      _setSortReversed(!sortReversed);
    }
  };

  const filteredColumns = useFilteredColumns(data.columns);

  const columnList = useMemo(() => {
    const columns = sortBy(filteredColumns, sortKey);
    if (sortReversed) {
      return columns.reverse();
    }
    return columns;
  }, [filteredColumns, sortKey, sortReversed]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div>
        <Alert
          type="error"
          message="Profiling service error"
          description={JSON.stringify(error, null, 2)}
        />
      </div>
    );
  }

  return (
    <RootFlex direction="column">
      <ProfileStatusMessage resultType={profileResultType} />
      <Title level={4}>Table summary</Title>
      <CardsFlex direction="row">
        <Card className="z-2">
          <header>Rows profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <StyledCount $isRunning={!fullProfile.isFetched}>
              {data.rowCount}
            </StyledCount>
            <ProfileCoverageLabel
              coverageType="rows"
              resultType={profileResultType}
            />
          </Flex>
        </Card>
        <Card className="z-2">
          <header>Columns profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <StyledCount $isRunning={!fullProfile.isFetched}>
              {Object.values(data.columns).length}
            </StyledCount>
            <ProfileCoverageLabel
              coverageType="columns"
              resultType={profileResultType}
            />
          </Flex>
        </Card>
      </CardsFlex>
      <Flex style={{ width: '100%', paddingBottom: '8px' }}>
        <FilterBar areTypesFetched={areTypesFetched} />
      </Flex>
      <Flex style={{ width: '100%', height: '100%' }}>
        <AutoResizer>
          {({ width, height }) => (
            <div style={{ width, height }}>
              <Table>
                <ProfileTableHeader
                  sortKey={sortKey}
                  setSortKey={setSortKey}
                  sortReversed={sortReversed}
                  setSortReversed={_setSortReversed}
                />
                <tbody>
                  {columnList.map((column) => (
                    <ProfileRow
                      key={column.label}
                      allCount={data.rowCount}
                      profile={column}
                    />
                  ))}
                </tbody>
              </Table>
              <div style={{ height: '24px' }} />
            </div>
          )}
        </AutoResizer>
      </Flex>
    </RootFlex>
  );
};

const Card = styled.div`
  padding: 16px;
  margin: 10px 10px 20px 0;
  border: 1px solid ${Colors['greyscale-grey3'].hex()};
  border-radius: 8px;
  min-width: 277px;
  header {
    display: block;
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .count {
    color: ${Colors['greyscale-grey9'].hex()};
    font-weight: 900;
    font-size: 24px;
    line-height: 32px;
  }
  .coverage {
    padding: 8px 12px;
    color: #22633c;
    background: rgba(57, 162, 99, 0.12);
    border-radius: 6px;
  }
  .coverage.running {
    color: black;
    background: rgb(247 97 97 / 12%);
  }
`;

const RootFlex = styled(Flex)`
  padding: 36px 24px 24px;
  height: 100%;
`;

const CardsFlex = styled(Flex)`
  padding: 24px 0;
`;
const Table = styled.table`
  margin: 0;
  width: 100%;
  border-radius: 8px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
`;

const StyledCount = styled.div<{ $isRunning?: boolean }>`
  color: ${({ $isRunning }) =>
    $isRunning ? Colors['text-hint'].hex() : Colors['greyscale-grey9'].hex()};
  font-weight: 900;
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 0;
`;
