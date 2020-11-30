import React, { useMemo } from 'react';
import { Column, TableOptions, useExpanded, useTable } from 'react-table';
import { EditStyleTable, StyledTable } from 'styles/StyledTable';
import styled from 'styled-components';
import { DetailsCol, IntegrationFieldValue } from './DetailsCols';

const DetailsTD = styled((props) => <td {...props}>{props.children}</td>)`
  span {
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
  }
`;

export interface EditableHelpers {
  updateData: (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => void;
  undoChange: (rowIndex: number) => void;
  saveChange: (rowIndex: number, data: DetailsCol) => void;
}

interface OwnProps<T extends object> extends EditableHelpers {
  data: T[];
  columns: Column<T>[];
}

const DetailsTable = <T extends object>({
  data: originalData,
  columns,
  updateData,
  undoChange,
  saveChange,
}: OwnProps<T>) => {
  const dataSource = useMemo(() => {
    return originalData;
  }, [originalData]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);

  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable(
    {
      columns: headerCols,
      data: dataSource,
      autoResetExpanded: false,
      updateData,
      undoChange,
      saveChange,
    } as TableOptions<T>,
    useExpanded
  );

  return (
    <StyledTable>
      <EditStyleTable
        {...getTableProps()}
        className="cogs-table integrations-table"
      >
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`cogs-table-row integrations-table-row ${
                  row.isSelected ? 'row-active' : ''
                }`}
              >
                {row.cells.map((cell) => {
                  return (
                    <DetailsTD
                      {...cell.getCellProps()}
                      className={`${cell.column.id}`}
                    >
                      {cell.render('Cell')}
                    </DetailsTD>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </EditStyleTable>
    </StyledTable>
  );
};

export default DetailsTable;
