import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { TOKENS } from '@platypus-app/di';
import {
  ErrorType,
  DataModelVersion,
  Result,
  getDataModelEndpointUrl,
  PublishDataModelVersionDTO,
  DataManagementHandler,
  PlatypusError,
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useDataModelState } from '../../hooks/useDataModelState';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../components/DataModelHeader';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { useInjection } from '@platypus-app/hooks/useInjection';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useQueryClient } from '@tanstack/react-query';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { EndpointModal } from '../components/EndpointModal';
import { getProject } from '@cognite/cdf-utilities';
import { getCogniteSDKClient } from '../../../../../environments/cogniteSdk';
import { ToggleVisualizer } from '../components/ToggleVisualizer/ToggleVisualizer';
import { usePersistedState } from '@platypus-app/hooks/usePersistedState';
import {
  PublishVersionModal,
  VersionType,
} from '../components/PublishVersionModal';

const MAX_TYPES_VISUALIZABLE = 30;

export interface DataModelPageProps {
  dataModelExternalId: string;
}

export const DataModelPage = ({ dataModelExternalId }: DataModelPageProps) => {
  const navigate = useNavigate();

  const { t } = useTranslation('SolutionDataModel');

  const { track } = useMixpanel();

  const { data: dataModelVersions, refetch: refetchDataModelVersions } =
    useDataModelVersions(dataModelExternalId);
  const queryClient = useQueryClient();
  const {
    currentTypeName,
    editorMode,
    graphQlSchema,
    selectedVersionNumber,
    typeDefs,
  } = useSelector<DataModelState>((state) => state.dataModel);
  const { setEditorMode, setGraphQlSchema, setIsDirty, parseGraphQLSchema } =
    useDataModelState();
  const { removeLocalDraft, getLocalDraft } =
    useLocalDraft(dataModelExternalId);

  const { data: dataModel } = useDataModel(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  const latestDataModelVersion = useSelectedDataModelVersion(
    DEFAULT_VERSION_PATH,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  const localDraft = getLocalDraft(selectedDataModelVersion.version);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  /*
  If in view mode and there are no published versions, set to edit mode. This should
  only happen on mount and we can avoid using an effect here because that would involve
  a wasted render.
  */
  if (editorMode === SchemaEditorMode.View && dataModelVersions?.length === 0) {
    setEditorMode(SchemaEditorMode.Edit);
  }

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    dataModelTypeDefsBuilder.clear();
    navigate(
      `/data-models/${dataModel?.space}/${dataModelExternalId}/${dataModelVersion.version}/data`,
      { replace: true }
    );
  };

  const [isVisualizerOn, setIsVisualizerOn] = usePersistedState(
    true,
    `${dataModelExternalId}::isVisualizerOn`
  );

  // Use this hook as init livecycle
  useEffect(() => {
    if (localDraft) {
      setGraphQlSchema(localDraft.schema);
      parseGraphQLSchema(localDraft.schema);
      setEditorMode(SchemaEditorMode.Edit);
      setIsDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickPublish = async () => {
    setUpdating(true);

    try {
      const dataModelValidationResult = await dataModelVersionHandler.validate({
        ...selectedDataModelVersion,
        space: dataModelExternalId,
        schema: graphQlSchema,
        version: selectedDataModelVersion?.version,
      });

      if (dataModelValidationResult.isFailure) {
        const error = PlatypusError.fromDataModelValidationError(
          dataModelValidationResult.errorValue()
        );

        if ((error?.type as ErrorType) === 'BREAKING_CHANGE') {
          setBreakingChanges(error.message);
          setShowPublishModal(true);
        } else if (error?.type as ErrorType) {
          Notification({
            type: 'error',
            title: 'Error: could not validate data model',
            message: error.message,
            validationErrors: error.errors || [],
          });
        }
      } else {
        setShowPublishModal(true);
      }
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Error: could not validate data model',
        message: t(
          'schema_validation_error',
          `Validation of the data model failed. ${error}`
        ),
      });
    }

    setUpdating(false);
  };

  const getVersionType = (): VersionType => {
    if (
      !dataModelVersions ||
      dataModelVersions.length === 0 ||
      (dataModelVersions.length === 1 && !dataModelVersions[0].schema)
    )
      return 'FIRST';
    if (breakingChanges) return 'BREAKING';
    return 'NON_BREAKING';
  };

  const getSuggestedVersion = () => {
    if (getVersionType() === 'FIRST') return '1';

    const publishedVersions =
      dataModelVersions?.map((ver) => ver.version) || [];
    const currentVersion = parseInt(selectedDataModelVersion.version, 10);

    let suggestedVersion =
      !isNaN(currentVersion) &&
      !publishedVersions.includes(`${currentVersion + 1}`)
        ? currentVersion + 1
        : publishedVersions.length + 1;

    while (publishedVersions.includes(`${suggestedVersion}`))
      suggestedVersion += 1;

    return `${suggestedVersion}`;
  };

  const handleSaveOrPublish = async (newVersion: string) => {
    try {
      const version = selectedDataModelVersion?.version;
      const draftVersion = version;
      let result: Result<DataModelVersion>;
      const publishNewVersion =
        breakingChanges ||
        !dataModelVersions ||
        dataModelVersions.length === 0 ||
        newVersion !== version;

      if (publishNewVersion) {
        setUpdating(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: newVersion,
          },
          'NEW_VERSION'
        );

        if (breakingChanges) {
          track('BreakingChanges', {
            dataModel: dataModelExternalId,
          });
        }
      } else {
        setSaving(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: newVersion,
          },
          'PATCH'
        );
      }

      if (result.error?.type as ErrorType) {
        Notification({
          type: 'error',
          title: 'Error: could not update data model',
          message: result.error.message,
          validationErrors: result.error.errors || [],
        });
      }

      if (result.isSuccess) {
        track('Publishing', {
          dataModel: dataModelExternalId,
        });
        removeLocalDraft(draftVersion);
        setIsDirty(false);

        if (publishNewVersion) {
          // add new version to react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(dataModelExternalId),
            (oldDataModelVersions = []) => {
              return [...oldDataModelVersions, result.getValue()];
            }
          );

          refetchDataModelVersions();
          navigate(
            `/data-models/${dataModel?.space}/${dataModelExternalId}/${DEFAULT_VERSION_PATH}/data`,
            { replace: true }
          );
        } else {
          // update version in react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(dataModelExternalId),
            (oldDataModelVersions = []) => {
              return oldDataModelVersions.map((dataModelVersion) => {
                return dataModelVersion.version === version
                  ? result.getValue()
                  : dataModelVersion;
              });
            }
          );
          refetchDataModelVersions();
        }

        Notification({
          type: 'success',
          title: t(
            `data_model_${
              publishNewVersion ? 'published' : 'updated'
            }_toast_title`,
            `Data model ${publishNewVersion ? 'published' : 'updated'}`
          ),
          message: `${t('version', 'Version')} ${newVersion} ${t(
            'of_your_data_model_was_successfully',
            'of your data model was successfully'
          )} ${
            publishNewVersion
              ? t('published', 'published')
              : t('updated', 'updated')
          }.`,
        });
        // Must be located here for fetching versions correctly and updating schema version selector.
        //
        setEditorMode(SchemaEditorMode.View);
      }
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Error: could not save data model',
        message: t(
          'schema_save_error',
          `Saving of the data model failed. ${error}`
        ),
      });
    }
    // Must be located here to work correctly with Promt.
    setUpdating(false);
    setSaving(false);
    setShowPublishModal(false);
    setBreakingChanges('');
  };

  const handleDiscardClick = () => {
    dataModelTypeDefsBuilder.clear();
    setGraphQlSchema(latestDataModelVersion.schema);
  };

  return (
    <>
      <PageContentLayout>
        <PageContentLayout.Header>
          <DataModelHeader
            dataModelExternalId={dataModelExternalId}
            dataModelVersions={dataModelVersions}
            isSaving={saving}
            isUpdating={updating}
            latestDataModelVersion={latestDataModelVersion}
            localDraft={localDraft}
            onDiscardClick={handleDiscardClick}
            onPublishClick={handleClickPublish}
            onEndpointClick={() => setShowEndpointModal(true)}
            title={t('data_model_title', 'Data model')}
            onDataModelVersionSelect={handleDataModelVersionSelect}
            selectedDataModelVersion={selectedDataModelVersion}
          />
        </PageContentLayout.Header>
        <PageContentLayout.Body style={{ flexDirection: 'row' }}>
          <SplitPanelLayout
            sidebar={
              <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                <EditorPanel
                  editorMode={editorMode}
                  space={dataModel?.space || ''}
                  version={selectedDataModelVersion.version}
                  externalId={dataModelExternalId}
                  isPublishing={saving || updating}
                />
              </ErrorBoundary>
            }
            sidebarWidth={640}
            sidebarMinWidth={440}
            content={
              <Flex
                data-testid="Schema_visualization"
                direction="column"
                style={{ height: '100%' }}
              >
                <PageToolbar
                  title={t('preview_title', 'Preview')}
                  size={Size.SMALL}
                >
                  {typeDefs.types.length > MAX_TYPES_VISUALIZABLE && (
                    <ToggleVisualizer
                      isVisualizerOn={isVisualizerOn}
                      setIsVisualizerOn={setIsVisualizerOn}
                    />
                  )}
                </PageToolbar>
                <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                  <SchemaVisualizer
                    active={currentTypeName || undefined}
                    graphQLSchemaString={graphQlSchema}
                    isVisualizerOn={
                      typeDefs.types.length <= MAX_TYPES_VISUALIZABLE ||
                      isVisualizerOn
                    }
                  />
                </ErrorBoundary>
              </Flex>
            }
          />
          )
        </PageContentLayout.Body>
      </PageContentLayout>

      {showEndpointModal && (
        <EndpointModal
          endpoint={getDataModelEndpointUrl(
            getProject(),
            selectedDataModelVersion.externalId,
            selectedDataModelVersion.version,
            getCogniteSDKClient().getBaseUrl()
          )}
          onRequestClose={() => setShowEndpointModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishVersionModal
          versionType={getVersionType()}
          suggestedVersion={getSuggestedVersion()}
          currentVersion={`${selectedDataModelVersion.version || '1'}`}
          publishedVersions={dataModelVersions?.map((ver) => ver.version) || []}
          breakingChanges={breakingChanges}
          onCancel={() => {
            setBreakingChanges('');
            setShowPublishModal(false);
          }}
          onUpdate={handleSaveOrPublish}
          isUpdating={updating}
          isSaving={saving}
        />
      )}
    </>
  );
};
