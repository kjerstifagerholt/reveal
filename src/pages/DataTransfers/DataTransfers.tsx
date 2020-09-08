import React, { useContext, useEffect, useReducer, useState } from 'react';
import { DataTransferObject } from 'typings/interfaces';
import { Checkbox, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import ApiContext from 'contexts/ApiContext';
import AuthContext from 'contexts/AuthContext';
import APIErrorContext from 'contexts/APIErrorContext';
// import styled from 'styled-components';
import { ContentContainer, TableActions } from '../../elements';
import 'antd/dist/antd.css';
import config from './datatransfer.config';
import DetailView from '../../components/Organisms/DetailView';
import ErrorMessage from '../../components/Molecules/ErrorMessage';

enum ProgressState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

enum Action {
  LOAD = 'load',
  SUCCEED = 'succeed',
  FAIL = 'fail',
  ADD_COLUMN = 'add_column',
  REMOVE_COLUMN = 'remove_column',
}

type DataTransfersError = {
  message: string;
  status: number;
};

interface Data {
  data: DataTransferObject[];
  rawColumns: ColumnsType<DataTransferObject>;
  allColumnNames: string[];
  selectedColumnNames: string[];
  columns: ColumnsType<DataTransferObject>;
}

interface DataTransfersState {
  status: ProgressState;
  data: Data;
  error: DataTransfersError | undefined;
}

type DataTransfersAction =
  | { type: Action.LOAD }
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError };

type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };

type ActiveColumn = {
  column: {
    title: string;
    dataIndex: string;
    key: string;
  };
  columnKey: string;
  field: string;
  order: string;
};

const initialDataTransfersState: DataTransfersState = {
  status: ProgressState.LOADING,
  data: {
    data: [],
    rawColumns: [],
    allColumnNames: [],
    selectedColumnNames: [],
    columns: [],
  },
  error: undefined,
};

function selectColumns(
  dataTransferObjects: DataTransferObject[],
  columnNames: string[]
): ColumnsType<DataTransferObject> {
  const results: ColumnsType<DataTransferObject> = [];
  Object.keys(dataTransferObjects[0]).forEach((key) => {
    if (columnNames.length === 0 || columnNames.includes(key)) {
      results.push({
        title: key,
        dataIndex: key,
        key,
        sorter: (a, b) => (a[key] < b[key] ? -1 : 1),
        filters: config.filterableColumns.includes(key)
          ? createFiltersArrayForColumn(dataTransferObjects, key)
          : undefined,
        onFilter: (value, record) => {
          return record[key]?.includes(value);
        },
      });
    }
  });
  return results;
}

function DataTransfersReducer(
  state: DataTransfersState,
  action: DataTransfersAction | UserAction
) {
  switch (action.type) {
    case Action.LOAD: {
      return {
        ...state,
        status: ProgressState.LOADING,
      };
    }
    case Action.SUCCEED: {
      return {
        ...state,
        status: ProgressState.SUCCESS,
        data: { ...state.data, ...action.payload },
      };
    }
    case Action.FAIL: {
      return {
        ...state,
        status: ProgressState.ERROR,
        error: action.error,
      };
    }
    case Action.ADD_COLUMN: {
      const tmp = [...state.data!.selectedColumnNames];
      tmp.push(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    case Action.REMOVE_COLUMN: {
      const tmp = [...state.data.selectedColumnNames];
      tmp.splice(tmp.indexOf(action.payload), 1);
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    default: {
      return state;
    }
  }
}

const SelectColumnsMenu = ({
  columnNames,
  selectedColumnNames,
  onChange,
}: {
  columnNames: string[];
  selectedColumnNames: string[];
  onChange: (e: CheckboxChangeEvent) => void;
}) => {
  return (
    <Menu>
      {columnNames.map((name) => (
        <Menu.Item key={name}>
          <Checkbox
            name={name}
            id={name}
            onChange={onChange}
            checked={selectedColumnNames.includes(name)}
          >
            {name}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );
};

/*
const ShowDetails = styled.span`
  color: var(--cogs-greyscale-grey6);
  cursor: pointer;
`;
*/

function getAllValuesFromColumn(
  dataSet: DataTransferObject[],
  columnName: string
): string[] {
  const results: string[] = [];
  dataSet.forEach((row) => results.push(row[columnName]));
  return results;
}

function getDistinctValuesFromStringArray(values: string[]): string[] {
  return values.filter(
    (value, index) => value !== null && values.indexOf(value) === index
  );
}

function createFiltersArrayForColumn(
  dataSet: DataTransferObject[],
  columnName: string
): { text: string; value: string }[] {
  const results: { text: string; value: string }[] = [];
  const all: string[] = getAllValuesFromColumn(dataSet, columnName);
  const distinct: string[] = getDistinctValuesFromStringArray(all);
  distinct.sort().forEach((value) =>
    results.push({
      text: value,
      value,
    })
  );
  return results;
}

const DataTransfers: React.FC = () => {
  const [{ status, data, error }, dispatch] = useReducer(
    DataTransfersReducer,
    initialDataTransfersState
  );

  const { api } = useContext(ApiContext);
  const { token } = useContext(AuthContext);
  const { addError } = useContext(APIErrorContext);

  const [
    selectedTransfer,
    setSelectedTransfer,
  ] = useState<DataTransferObject | null>(null);

  function getColumnNames(dataTransferObjects: DataTransferObject[]): string[] {
    const results: string[] = [];
    Object.keys(dataTransferObjects[0]).forEach((k) => {
      results.push(k);
    });
    return results;
  }

  function updateColumnSelection(event: CheckboxChangeEvent) {
    const columnName = event.target.name;
    if (columnName === undefined) return;
    if (event.target.checked) {
      dispatch({ type: Action.ADD_COLUMN, payload: columnName });
    } else {
      dispatch({ type: Action.REMOVE_COLUMN, payload: columnName });
    }
  }

  useEffect(() => {
    function fetchDataTransfers() {
      dispatch({ type: Action.LOAD });
      api!.objects
        .get()
        .then((response: DataTransferObject[]) => {
          if (!response[0].error) {
            dispatch({
              type: Action.SUCCEED,
              payload: {
                data: response,
                columns: selectColumns(
                  response,
                  config.initialSelectedColumnNames
                ),
                rawColumns: selectColumns(response, []),
                allColumnNames: getColumnNames(response),
                selectedColumnNames: config.initialSelectedColumnNames,
              },
            });
          } else {
            throw new Error(response[0].status);
          }
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
          dispatch({ type: Action.FAIL, error: err });
        });
    }
    if (token && token !== 'NO_TOKEN') {
      fetchDataTransfers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch transfers - ${error.message}`}
        fullView
      />
    );
  }

  data.columns.push({
    dataIndex: 'actions',
    key: 'actions',
    /*
    render: (_: any, record) => {
      // Temp. out commented because of heard coded values in DetailView

      return (
        <Tooltip content={<span>Show {record.name} details</span>}>
          <ShowDetails>
            <Icon
              type="VerticalEllipsis"
              onClick={() => setSelectedTransfer(record)}
            />
          </ShowDetails>
        </Tooltip>
      );

    },
    */
    render: () => {
      return null;
    },
  });

  return (
    <ContentContainer>
      <TableActions>
        <Dropdown
          content={
            <SelectColumnsMenu
              columnNames={data.allColumnNames}
              selectedColumnNames={data.selectedColumnNames}
              onChange={updateColumnSelection}
            />
          }
        >
          <Button
            type="link"
            size="small"
            style={{ color: 'var(--cogs-greyscale-grey7)' }}
          >
            <Icon type="Settings" />
          </Button>
        </Dropdown>
      </TableActions>
      <Table
        dataSource={data.data}
        columns={data.columns}
        loading={status === ProgressState.LOADING}
        rowKey="id"
        key={data.selectedColumnNames.join('')}
      />
      <DetailView
        showing={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
      />
    </ContentContainer>
  );
};

export default DataTransfers;
