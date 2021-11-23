import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContainer } from 'utils/utils';

import NewHeader from 'components/NewHeader';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import { Button, Tooltip } from '@cognite/cogs.js';
import theme from 'styles/theme';
import Tabs from 'antd/lib/tabs';
import ExploreData from 'components/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';
import { SeperatorLine, DetailsPane } from 'utils/styledComponents';
import DataSetEditor from 'pages/DataSetEditor';
import notification from 'antd/lib/notification';
import BasicInfoCard from 'components/BasicInfoCard';
import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import {
  useDataSetWithIntegrations,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';

const { TabPane } = Tabs;

interface DataSetDetailsRouteParams {
  dataSetId: string;
}

const DataSetDetails = (): JSX.Element => {
  const [editDrawerVisible, setEditDrawerVisible] = useState<boolean>(false);
  const [changesSaved, setChangesSaved] = useState<boolean>(true);

  const { appPath } = useParams<{ appPath: string }>();

  const { dataSetId } = useParams<DataSetDetailsRouteParams>();

  const {
    dataSetWithIntegrations,
    isLoading: loading,
    error,
  } = useDataSetWithIntegrations(Number(dataSetId));
  const dataSet = dataSetWithIntegrations?.dataSet;

  const { setSelectedDataSet } = useSelectedDataSet();

  const { data: hasWritePermissions } = useUserCapabilities(
    'datasetsAcl',
    'WRITE'
  );

  const { updateDataSetVisibility, isLoading: isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const archiveButton = (
    <Tooltip content="Archived data is not deleted. You can restore archived data sets later.">
      <Button
        disabled={!hasWritePermissions}
        onClick={() => archiveDataSet()}
        style={{
          marginLeft: '10px',
        }}
        loading={isUpdatingDataSetVisibility}
      >
        Archive
      </Button>
    </Tooltip>
  );

  const restoreButton = (
    <Tooltip content="Archived data is not deleted. You can restore archived data sets later.">
      <Button
        disabled={!hasWritePermissions}
        onClick={() => restoreDataSet()}
        style={{
          marginLeft: '10px',
        }}
        loading={isUpdatingDataSetVisibility}
      >
        Restore
      </Button>
    </Tooltip>
  );

  const editButton = (
    <Button
      disabled={!hasWritePermissions}
      onClick={() => {
        setSelectedDataSet(Number(dataSetId));
        setEditDrawerVisible(true);
      }}
      style={{
        marginLeft: '10px',
      }}
    >
      Edit
    </Button>
  );

  const discardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="danger"
        size="small"
        onClick={() => {
          setEditDrawerVisible(false);
          setChangesSaved(true);
          notification.close('navigateAway');
        }}
      >
        Discard changes
      </Button>
    </div>
  );

  const onEditDrawerClose = () => {
    if (changesSaved) {
      setEditDrawerVisible(false);
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

  const handleModalClose = () => {
    setEditDrawerVisible(false);
  };

  const editDrawer = (
    <DataSetEditor
      visible={editDrawerVisible}
      onClose={onEditDrawerClose}
      changesSaved={changesSaved}
      setChangesSaved={setChangesSaved}
      handleCloseModal={() => handleModalClose()}
    />
  );

  const archiveDataSet = () => {
    if (dataSet) {
      updateDataSetVisibility(dataSet, true);
    }
  };

  const restoreDataSet = () => {
    if (dataSet) {
      updateDataSetVisibility(dataSet, false);
    }
  };

  const renderLoadingError = (isLoading: boolean) => {
    if (isLoading) {
      return <Spin />;
    }
    return <ErrorMessage error={error} />;
  };

  if (dataSet) {
    const actions = (
      <div>
        {editButton}
        {editDrawer}
        {dataSet.metadata.archived ? restoreButton : archiveButton}
      </div>
    );

    return (
      <div>
        <NewHeader
          title={dataSet.name}
          ornamentColor={theme.specificTitleOrnamentColor}
          breadcrumbs={[
            { title: 'Data sets', path: `/${appPath}` },
            { title: dataSet.name },
          ]}
          help="https://docs.cognite.com/cdf/data_governance/concepts/datasets"
          rightItem={actions}
        />
        <div style={{ alignItems: 'center', display: 'flex' }} />
        <Card loading={loading && !dataSet}>
          <Row>
            <Col md={6} xs={24}>
              <BasicInfoCard dataSet={dataSet} />
            </Col>
            <Col md={1} xs={0}>
              <SeperatorLine />
            </Col>
            <Col md={17} xs={24}>
              <DetailsPane>
                <Tabs animated={false} defaultActiveKey="1" size="large">
                  <TabPane tab="EXPLORE DATA" key="1">
                    <ExploreData
                      loading={loading}
                      dataSetId={Number(dataSetId)}
                    />
                  </TabPane>
                  <TabPane tab="LINEAGE" key="2">
                    <Lineage
                      dataSetWithIntegrations={dataSetWithIntegrations}
                    />
                  </TabPane>
                  <TabPane tab="DOCUMENTATION" key="3">
                    <DocumentationsTab dataSet={dataSet} />
                  </TabPane>
                  <TabPane tab="ACCESS CONTROL" key="4">
                    <AccessControl
                      dataSetId={dataSet.id}
                      writeProtected={dataSet.writeProtected}
                    />
                  </TabPane>
                </Tabs>
              </DetailsPane>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <NewHeader
        title="Data set details"
        ornamentColor={theme.specificTitleOrnamentColor}
        breadcrumbs={[
          { title: 'Data sets', path: `/${appPath}` },
          { title: 'Data set details' },
        ]}
      />
      {renderLoadingError(loading)}
    </div>
  );
};

export default DataSetDetails;
