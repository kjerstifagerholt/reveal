import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { Sequence } from '@cognite/sdk';

import { getHiddenColumns, useTranslation } from '@data-exploration-lib/core';
import { InternalSequenceData } from '@data-exploration-lib/domain-layer';

import { useSequencesMetadataColumns } from '../Search';

import { Wrapper } from './elements';

export const SequenceDetailsTable = ({
  onRowClick = noop,
  onRowSelection = noop,
  ...props
}: Omit<TableProps<InternalSequenceData>, 'columns'>) => {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.columns,
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.id(props.query),
        tableColumns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  const onRowClickHandler = (row: InternalSequenceData) => {
    if (props.enableSelection) {
      onRowClick(row);
      return;
    }

    onRowSelection(
      (old) => ({ ...old, [String(row.id)]: true }),
      [{ id: row.id, externalId: row.externalId, type: 'sequence' }]
    );
  };

  return (
    <Wrapper>
      <Table<InternalSequenceData>
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={4}
        onChangeSearchInput={setMetadataKeyQuery}
        showLoadButton
        enableSelection
        onRowClick={onRowClickHandler}
        {...props}
      />
    </Wrapper>
  );
};
