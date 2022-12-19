import React, { useContext, useEffect, useState } from 'react';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { Loader, Table } from '@cognite/cogs.js';
import APIErrorContext from 'contexts/APIErrorContext';
import config from 'configs/datatransfer.config';
import { useDataTransfersState } from 'contexts/DataTransfersContext';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import { ProgressState } from 'contexts/types/dataTransfersTypes';
import { sortColumnsByRules } from 'utils/sorts';
import { curateTableColumns } from 'utils/Table/curate';

import DetailView from './components/DetailView/DetailView';
import { DetailViewWrapper } from './elements';
import TableActions from './TableActions';
import { dataTransfersColumnRules } from './utils/Table/columnRules';
import { generatesDataTypesColumnsFromData } from './utils/Table/generate';
import { DataTransfersTableData } from './types';

const DataTransfers: React.FC = () => {
  const { error } = useContext(APIErrorContext);

  const {
    status,
    data,
    filters: { selectedConfiguration },
  } = useDataTransfersState();

  const [filteredData, setFilteredData] = useState<DataTransfersTableData[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] = useState<
    DataTransfersTableData | undefined
  >(undefined);

  function renderNoDataText() {
    if (filteredData.length > 0) return null;

    let message = 'Select configuration';

    if (selectedConfiguration && data.data.length < 1) {
      message = 'No data';
    }

    return (
      <EmptyTableMessage
        text={message}
        isLoading={status === ProgressState.LOADING}
      />
    );
  }

  const handleDetailViewClick = (record: DataTransfersTableData) => {
    setSelectedRecord(record);
  };

  const tableColumns = React.useMemo(() => {
    const generateColumns = generatesDataTypesColumnsFromData(
      data.data,
      data.selectedColumnNames
    );

    const curatedColumns = curateTableColumns<DataTransfersTableData>(
      generateColumns,
      dataTransfersColumnRules({ handleDetailViewClick })
    );

    return sortColumnsByRules(curatedColumns, config.columnOrder);
  }, [data.data, data.selectedColumnNames]);

  useEffect(() => {
    setFilteredData(data.data);
  }, [data.data]);

  if (status === ProgressState.LOADING) {
    <Loader />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch transfers - ${error.message} (status: ${error.status})`}
        fullView
      />
    );
  }

  return (
    <>
      <TableActions />

      <Table<DataTransfersTableData>
        rowKey={(data) => `datatypes-${data.id}`}
        dataSource={filteredData}
        columns={tableColumns}
        filterable
        locale={{ emptyText: renderNoDataText() }}
        pagination={false}
      />
      <DetailViewWrapper>
        {selectedRecord && (
          <DetailView
            onClose={() => setSelectedRecord(undefined)}
            record={selectedRecord}
          />
        )}
      </DetailViewWrapper>
    </>
  );
};

export default DataTransfers;
