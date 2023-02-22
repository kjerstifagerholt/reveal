import { useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { useAssets } from 'hooks/assets';

type AssetListTableRecord = { key: string } & Pick<
  Asset,
  'name' | 'rootId' | 'dataSetId' | 'id' | 'description' | 'lastUpdatedTime'
>;
type AssetListTableRecordCT = ColumnType<AssetListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

type Props = {};
export default function AssetTable({}: Props) {
  const { data, isInitialLoading } = useAssets();

  const dataSource = useMemo(
    () =>
      data?.pages[0]?.items?.map((a) => ({ ...a, key: a.id.toString() })) || [],
    [data]
  );

  const columns: AssetListTableRecordCT[] = useMemo(
    () => [
      {
        title: 'NAME',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'DESCRIPTION',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'LAST_UPDATED',
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: Date) => value.toLocaleString(),
      },
    ],
    []
  );

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <Table<AssetListTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={dataSource}
    />
  );
}
