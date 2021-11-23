import React, { useEffect, useState } from 'react';
import { History } from 'history';
import NewHeader from 'components/NewHeader';
import { Button, Icon, Input } from '@cognite/cogs.js';
import Table from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import notification from 'antd/lib/notification';
import { DataSet } from 'utils/types';
import Checkbox from 'antd/lib/checkbox';
import DataSetEditor from 'pages/DataSetEditor';
import { Dropdown, DropdownMenuContent } from 'components/DropdownMenu';

import { trackEvent } from '@cognite/cdf-route-tracker';
import SelectorFilter from 'components/SelectorFilter';
import { handleDataSetsFilters } from 'utils/filterUtils';
import { setItemInStorage } from 'utils/localStorage';
import { createLink } from '@cognite/cdf-utilities';
import { getContainer } from 'utils/utils';
import useLocalStorage from 'hooks/useLocalStorage';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useParams } from 'react-router';
import isArray from 'lodash/isArray';
import getTableColumns, { DataSetRow } from './TableColumns';
import {
  DataSetWithIntegrations,
  useDataSetsList,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useWithIntegrations } from '../../hooks/useWithIntegrations';
import { useDataSetMode, useSelectedDataSet } from '../../context/index';

interface DataSetsListProps {
  history: History;
}

const DataSetsList = ({ history }: DataSetsListProps): JSX.Element => {
  const { data: withIntegrations, isFetched: didFetchWithIntegrations } =
    useWithIntegrations();

  const { appPath } = useParams<{ appPath: string }>();

  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [tableData, setTableData] = useState<DataSetRow[]>([]);
  const [searchValue, setSearchValue] = useLocalStorage<string>(
    'data-sets-search',
    ''
  );
  const [creationDrawerVisible, setCreationDrawerVisible] =
    useState<boolean>(false);
  const [showArchived, setShowArchived] = useLocalStorage<boolean>(
    'data-sets-show-archived',
    false
  );
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [userWarned, setUserWarned] = useState<boolean>(false);

  const { setMode } = useDataSetMode();

  const { setSelectedDataSet } = useSelectedDataSet();

  const {
    dataSetsWithIntegrations = [],
    isLoading: loading,
  } = useDataSetsList();
  const { updateDataSetVisibility, isLoading: isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const { data: hasWritePermissions } = useUserCapabilities(
    'datasetsAcl',
    'WRITE'
  );

  useEffect(() => {
    if (!loading) {
      handleTableData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSetsWithIntegrations, qualityFilter, searchValue, showArchived]);

  const handleModalClose = () => {
    setCreationDrawerVisible(false);
    setMode('create');
    setSelectedDataSet(undefined);
  };

  const handleTableData = () => {
    let tableDataSets: DataSetRow[] = [];
    if (dataSetsWithIntegrations?.length && !loading) {
      const dataSetsList = handleDataSetsFilters(
        showArchived,
        searchValue,
        setSearchValue,
        qualityFilter,
        dataSetsWithIntegrations
      );
      tableDataSets = dataSetsList.map(
        (dataSetWithIntegrations: DataSetWithIntegrations): DataSetRow => {
          const { dataSet, integrations } = dataSetWithIntegrations;
          return {
            key: dataSet.id,
            name: dataSet.name,
            description: dataSet.description,
            labels: (dataSet.metadata && dataSet.metadata.consoleLabels) || [],
            quality: dataSet.metadata.consoleGoverned,
            integrations,
            writeProtected: dataSet.writeProtected,
            archived:
              dataSet.metadata.archived !== undefined
                ? dataSet.metadata.archived
                : false,
          };
        }
      );
    }
    setTableData(tableDataSets);
  };

  const getSourcesList = () => {
    const sourceNames: string[] = [];
    dataSetsWithIntegrations.forEach((dataSet) => {
      if (dataSet?.metadata?.consoleSource?.names?.length)
        dataSet.metadata.consoleSource.names.forEach((name: string) => {
          if (!sourceNames.includes(name)) {
            sourceNames.push(name);
          }
        });
    });
    return sourceNames;
  };

  const handleRowInteraction = (value: DataSetRow) => {
    history.push(createLink(`/${appPath}/data-set/${value.key}`));
  };

  const actionsRender = (_: any, row: DataSetRow) => (
    <Dropdown
      content={
        <DropdownMenuContent
          actions={[
            {
              label: 'Edit',
              onClick: () => {
                editDataSet(row.key);
              },
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: 'Edit',
              key: 'edit',
            },
            {
              label: row.archived ? 'Restore' : 'Archive',
              onClick: () =>
                row.archived
                  ? restoreDataSet(row.key)
                  : archiveDataSet(row.key),
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: row.archived ? 'Restore' : 'Archive',
              key: row.archived ? 'restore' : 'archive',
            },
          ]}
        />
      }
    />
  );

  const statusColumn = {
    title: 'Status',
    key: 'status',
    width: '15%',
    render: (row: DataSetRow) =>
      row.archived && <Tag color="red">Archived</Tag>,
  };

  const actionsColumn = {
    title: <div style={{ textAlign: 'center', width: '100%' }}>Actions</div>,
    width: '10%',
    key: 'id',
    render: actionsRender,
  };

  const archiveDataSet = (key: number) => {
    const d = dataSetsWithIntegrations.find(curDs => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, true);
    }
  };

  const restoreDataSet = (key: number) => {
    const d = dataSetsWithIntegrations.find(curDs => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, false);
    }
  };

  const editDataSet = (key: number) => {
    setMode('edit');
    setSelectedDataSet(key);
    trackEvent('DataSets.EditingFlow.Starts editing data set');
    setCreationDrawerVisible(true);
  };

  const discardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="danger"
        size="small"
        onClick={() => {
          setCreationDrawerVisible(false);
          setMode('create');
          setSelectedDataSet(undefined);
          notification.close('navigateAway');
        }}
      >
        Discard changes
      </Button>
    </div>
  );
  const title = 'Data sets';

  const QualitySelector = (
    <SelectorFilter
      filterName="data-sets-governance"
      selectionOptions={[
        { name: 'Governed', value: 'governed' },
        { name: 'Ungoverned', value: 'ungoverned' },
      ]}
      setSelection={setQualityFilter}
      defaultValue={qualityFilter}
    />
  );
  const CreateButton = (
    <Button
      type="primary"
      icon="Plus"
      style={{ marginLeft: '20px', marginRight: '20px' }}
      onClick={() => {
        setCreationDrawerVisible(true);
        trackEvent('DataSets.CreationFlow.Starts creating data set');
        setUserWarned(false);
      }}
      disabled={!hasWritePermissions}
    >
      Create
    </Button>
  );
  const SearchBar = (
    <Input
      placeholder="Search by name, description, or labels"
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      icon="Search"
      style={{ width: '300px' }}
    />
  );

  const ActionToolbar = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {CreateButton}
      {QualitySelector}
      <Checkbox
        style={{ marginTop: '10px', marginLeft: '20px' }}
        onChange={(e) => setShowArchived(e.target.checked)}
        checked={showArchived}
      >
        Show archived data sets
      </Checkbox>
    </div>
  );

  const onClose = () => {
    if (userWarned || changesSaved) {
      setCreationDrawerVisible(false);
      setMode('create');
      setSelectedDataSet(undefined);
    } else {
      notification.warn({
        message: 'Warning',
        description: (
          <div>
            You have unsaved changes, are you sure you want to navigate away?
            {discardChangesButton}
          </div>
        ),
        key: 'navigateAway',
        getContainer,
      });
    }
  };

  if (!didFetchWithIntegrations) {
    return <Icon type="Loading" />;
  }

  return (
    <div>
      <NewHeader
        title={title}
        leftItem={SearchBar}
        rightItem={ActionToolbar}
        breadcrumbs={[{ title: 'Data sets', path: `/${appPath}` }]}
        help="https://docs.cognite.com/cdf/data_governance/concepts/datasets"
      />
      <DataSetEditor
        visible={creationDrawerVisible}
        onClose={onClose}
        changesSaved={changesSaved}
        setChangesSaved={setChangesSaved}
        sourceSuggestions={getSourcesList()}
        handleCloseModal={() => handleModalClose()}
      />
      <div style={{ alignItems: 'center', display: 'flex' }} />
      <Table
        rowKey="key"
        loading={loading}
        columns={[
          ...getTableColumns(
            dataSetsWithIntegrations.map(x => x.dataSet),
            showArchived,
            withIntegrations
          ),
          ...(showArchived ? [statusColumn] : []),
          actionsColumn,
        ]}
        dataSource={tableData}
        onRow={(record: DataSetRow) => ({
          onClick: () => {
            handleRowInteraction(record);
          },
        })}
        rowClassName={() => 'pointerMouse'}
        onChange={(_pagination, _filters, sorter) => {
          if (!isArray(sorter) && sorter?.columnKey && sorter?.order)
            setItemInStorage(sorter?.columnKey, sorter?.order);
        }}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default DataSetsList;
