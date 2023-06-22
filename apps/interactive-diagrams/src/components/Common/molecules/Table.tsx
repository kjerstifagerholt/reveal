import React, { useState } from 'react';

import styled from 'styled-components';

import { Table as AntdTable } from 'antd';
import { TableProps as AntdTableProps } from 'antd/es/table';

import { Colors } from '@cognite/cogs.js';

const PAGE_SIZE = 8;
const DEFAULT_PAGE = 1;

export interface CustomTableProps extends AntdTableProps<any> {
  options?: {
    secondary?: boolean;
    expandedRowPadding?: boolean;
    narrow?: boolean;
    pointer?: boolean;
    bordered?: boolean;
  };
}

export const Table = styled((props: CustomTableProps) => {
  const { options: _options, ...antProps } = props;
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const onPaginationChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(DEFAULT_PAGE);
    }
  };

  const defaultProps = {
    rowKey: 'id',
    pagination: {
      position: ['bottomLeft'] as ['bottomLeft'],
      hideOnSinglePage: false,
      showSizeChanger: true,
      pageSize,
      size: 'small' as const,
      current: page,
      onChange: onPaginationChange,
      onShowSizeChange: onPaginationChange,
      ...props.pagination,
    },
  };
  return <AntdTable {...antProps} {...defaultProps} />;
})`
  .ant-table {
    background: ${(props) =>
      props.options?.secondary
        ? Colors['decorative--grayscale--100']
        : Colors['decorative--grayscale--white']};
    border: ${(props) =>
      props.options?.bordered
        ? `1px solid ${Colors['decorative--grayscale--300']}`
        : 'none'};
    border-radius: ${(props) => (props.options?.bordered ? '8px' : '0')};

    tr > th.ant-table-selection-column,
    tr > td.ant-table-selection-column {
      padding: 0 16px;
    }
  }
  .ant-table-column-title {
    user-select: none;
  }
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters:hover::before {
    background-color: transparent;
  }
  .ant-table-thead > tr > th,
  .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-tbody > tr > td {
    height: 30px;
    padding: ${(props) => (props.options?.narrow ? '12px' : '16px')};
  }
  .ant-table-thead
    > tr
    > th
    .ant-table-header-column
    .ant-table-column-sorters {
    padding: 0 8px;
  }
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background-color: ${(props) =>
      props.options?.secondary
        ? Colors['decorative--grayscale--200']
        : Colors['decorative--blue--100']};
  }
  .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(
      .ant-table-row-expand-icon-cell
    ):not([colspan])::before {
    width: 0;
  }
  tr.ant-table-row-level-0 td {
    border-top: 1px solid ${Colors['decorative--grayscale--200']};
    border-bottom: 0;
  }

  tr.ant-table-expanded-row > td {
    padding: ${(props) => (props.options?.expandedRowPadding ? '0 16px' : '0')};
  }
  th {
    background: ${(props) =>
      props.options?.secondary
        ? Colors['decorative--grayscale--100']
        : Colors['decorative--grayscale--white']};
  }
  td {
    cursor: ${(props) => (props.options?.pointer ? 'pointer' : 'default')};
  }
  .ant-table-container table > thead > tr:first-child th:last-child {
    border-top-right-radius: ${(props) =>
      props.options?.bordered ? '8px' : '4px'};
  }
  .ant-table-container table > thead > tr:first-child th:first-child {
    border-top-left-radius: ${(props) =>
      props.options?.bordered ? '8px' : '4px'};
  }
`;
