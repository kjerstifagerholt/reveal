import React, { useMemo } from 'react';
import { Sequence } from '@cognite/sdk';
import { Table, TableProps } from 'components/Table/Table';
import { RelationshipLabels } from 'types';

import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';

export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;

const visibleColumns = [
  'name',
  'externalId',
  'relation',
  'lastUpdatedTime',
  'createdTime',
];
export const SequenceTable = (
  props: Omit<
    TableProps<SequenceWithRelationshipLabels | Sequence>,
    'columns'
  > &
    RelationshipLabels
) => {
  const columns = useMemo(
    () =>
      [
        { ...Table.Columns.name, enableHiding: false },
        Table.Columns.description,
        Table.Columns.externalId,
        {
          ...Table.Columns.columns,
          enableSorting: false,
        },
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id,
          enableSorting: false,
        },
        {
          ...Table.Columns.asset,
          enableSorting: false,
        },
        Table.Columns.dataSet,
      ] as ColumnDef<Sequence>[],
    []
  );
  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return <Table columns={columns} hiddenColumns={hiddenColumns} {...props} />;
};
