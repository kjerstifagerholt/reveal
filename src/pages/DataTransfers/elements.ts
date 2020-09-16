import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { Table } from 'antd';

export const ExpandRowIcon = styled(Icon)`
  cursor: pointer;
`;

export const RevisionContainer = styled.td`
  flex: 1;
`;

export const RevisionLabel = styled.div`
  font-size: 0.65rem;
`;

export const SubTable = styled(Table)`
  .ant-table {
    .ant-table-tbody .ant-table-row {
      background: #fafafa;

      .ant-table-cell {
        background: #fafafa;
        &:first-of-type {
          padding-left: 6px;
        }
        &:last-of-type {
          margin-left: auto;
          padding-right: 32px;
          text-align: right;
        }
      }
    }
  }
`;

export const StatusDot = styled.div<{ bgColor: string }>`
  border-radius: 50%;
  width: 0.7rem;
  height: 0.7rem;
  background-color: ${(props) => props.bgColor};
  margin: 0 auto;
`;
