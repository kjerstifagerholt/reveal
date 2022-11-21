import { Button, Flex, Title, Tooltip } from '@cognite/cogs.js';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import config from '@platypus-app/config/config';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import { useDataModels } from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModelCard } from '@platypus-app/modules/data-models/components/DataModelCard/DataModelCard';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { DataModel } from '@platypus/platypus-core';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CreateDataModel } from '../CreateDataModel';
import { DeleteDataModel } from '../DeleteDataModel';
import { StyledRow, StyledDataModelListWrapper } from '../elements';

export const DataModelsList = () => {
  const history = useHistory();
  const { t } = useTranslation('data-models');

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [dataModelToDelete, setDataModelToDelete] = useState<
    DataModel | undefined
  >(undefined);

  const dataModelsWriteAcl = useCapabilities('dataModelsAcl', ['WRITE'], {
    checkAll: true,
  });

  const {
    data: dataModels,
    isLoading,
    isError,
    refetch: refetchDataModels,
  } = useDataModels();

  if (isLoading) {
    return (
      <StyledPageWrapper>
        <Spinner />
      </StyledPageWrapper>
    );
  }

  if (isError) {
    return (
      <StyledDataModelListWrapper>
        <div className="emptyList">
          <FlexPlaceholder
            data-cy="data-models-error"
            title={t('error-loading-data-models', 'Unable to load Data Models')}
            description={t(
              'error-loading-data-models',
              'Something went wrong and we were notified about it. We were not able to load data models. Please try to refresh the page or select another type.'
            )}
          />
        </div>
      </StyledDataModelListWrapper>
    );
  }

  const renderList = () => {
    return (
      <StyledRow cols={3} gutter={20}>
        {dataModels!.map((dataModel) => (
          <DataModelCard
            dataModel={dataModel}
            onOpen={(openDataModel) => {
              history.push({
                pathname: `/data-models/${dataModel.space}/${openDataModel.id}/${DEFAULT_VERSION_PATH}`,
              });
            }}
            onEdit={(editDataModel) => {
              history.push({
                pathname: `/data-models/${dataModel.space}/${editDataModel.id}/${DEFAULT_VERSION_PATH}`,
              });
            }}
            onDelete={(deleteDataModel) =>
              setDataModelToDelete(deleteDataModel)
            }
            key={dataModel.id}
          />
        ))}
      </StyledRow>
    );
  };

  const renderEmptyList = () => {
    return (
      <div className="emptyList">
        <FlexPlaceholder
          data-cy="no-data-models"
          title={t('no_data_models_title', 'No data models yet')}
          description={t(
            'no-data-models-body',
            'No Data Models were found. Click Create to create one.'
          )}
        />
      </div>
    );
  };

  return (
    <StyledDataModelListWrapper>
      <Flex justifyContent="space-between" className="header">
        <Title level={3} data-cy="data-models-title">
          {t('data_models_title', 'Data Models')}
        </Title>
        <Tooltip
          disabled={dataModelsWriteAcl.isAclSupported}
          content={t(
            'create_data_model_btn_disabled_text',
            `Missing "${config.DATA_MODELS_ACL}.write" permission`
          )}
        >
          <Button
            type="primary"
            disabled={!dataModelsWriteAcl.isAclSupported}
            data-cy="create-data-model-btn"
            onClick={() => setIsCreateModalVisible(true)}
          >
            {t('create_data_model_btn', 'Create Data Model')}
          </Button>
        </Tooltip>
      </Flex>
      {dataModels && dataModels.length ? renderList() : renderEmptyList()}
      {isCreateModalVisible && (
        <CreateDataModel onCancel={() => setIsCreateModalVisible(false)} />
      )}
      {dataModelToDelete && (
        <DeleteDataModel
          dataModel={dataModelToDelete}
          onCancel={() => setDataModelToDelete(undefined)}
          onAfterDeleting={() => refetchDataModels()}
        />
      )}
    </StyledDataModelListWrapper>
  );
};
