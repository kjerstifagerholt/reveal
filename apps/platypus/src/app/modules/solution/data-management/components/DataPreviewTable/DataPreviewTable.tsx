import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DraftRowData } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DeleteInstancesDTO,
  KeyValueMap,
  PlatypusError,
  QuerySort,
} from '@platypus/platypus-core';
import {
  CellDoubleClickedEvent,
  CellEditingStartedEvent,
  ColDef,
  GridReadyEvent,
  RowDataUpdatedEvent,
  SortChangedEvent,
  ValueSetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import { useDraftRows } from '../../hooks/useDraftRows';
import { useNodesDeleteMutation } from '../../hooks/useNodesDeleteMutation';
import { usePublishedRowsCountMapByType } from '../../hooks/usePublishedRowsCountMapByType';
import { buildGridConfig } from '../../services/grid-config-builder';
import { CreateTransformationModal } from '../CreateTransformationModal';
import { DeleteRowsModal } from '../DeleteRowsModal/DeleteRowsModal';
import { PreviewPageHeader } from '../PreviewPageHeader/PreviewPageHeader';
import { SuggestionsModal } from '../SuggestionsModal/SuggestionsModal';

import { StyledDataPreviewTable } from './elements';
import { ErrorPlaceholder } from './ErrorPlaceholder';
import { NoRowsOverlay } from './NoRowsOverlay';
import { getSuggestionsAvailable, sanitizeRow } from './utils';
import {
  useManualPopulationFeatureFlag,
  useDataManagementDeletionFeatureFlag,
  useSuggestionsFeatureFlag,
} from '@platypus-app/flags';
import {
  CollapsiblePanelContainer,
  DataPreviewSidebarData,
} from './collapsible-panel-container';
import debounce from 'lodash/debounce';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useListDataSource } from '../../hooks/useListDataSource';

const pageSizeLimit = 100;

export interface DataPreviewTableProps {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelExternalId: string;
  version: string;
  space: string;
}

export type DataPreviewTableRef = {
  purgeInfiniteCache: () => void;
};

export const DataPreviewTable = forwardRef<
  DataPreviewTableRef,
  DataPreviewTableProps
>(
  (
    { dataModelType, dataModelTypeDefs, dataModelExternalId, version, space },
    ref
  ) => {
    const instanceIdCol = 'externalId';

    const { t } = useTranslation('DataPreviewTable');
    const [searchTerm, setSearchTerm] = useState('');
    const [isTransformationModalVisible, setIsTransformationModalVisible] =
      useState(false);
    // This property is used to trigger a rerender when a selection occurs in the grid
    const [, setSelectedPublishedRowsCount] = useState(0);
    const gridRef = useRef<AgGridReact>(null);
    const [fetchError, setFetchError] = useState(null);
    const { isEnabled: isManualPopulationEnabled } =
      useManualPopulationFeatureFlag();
    const { isEnabled: isSuggestionsEnabled } = useSuggestionsFeatureFlag();
    const { isEnabled: isDeletionEnabled } =
      useDataManagementDeletionFeatureFlag();
    const { data: dataModelVersions } =
      useDataModelVersions(dataModelExternalId);
    const selectedDataModelVersion = useSelectedDataModelVersion(
      version,
      dataModelVersions || [],
      dataModelExternalId,
      space || ''
    );

    const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

    const draftRowsData = useSelector(
      (state) => state.dataManagement.draftRows[dataModelType.name] || []
    );

    const { shouldShowDraftRows, shouldShowPublishedRows } = useSelector(
      (state) => ({
        shouldShowDraftRows: state.dataManagement.shouldShowDraftRows,
        shouldShowPublishedRows: state.dataManagement.shouldShowPublishedRows,
      })
    );

    const {
      updateRowData,
      removeDrafts,
      createNewDraftRow,
      deleteSelectedRows,
    } = useDraftRows();

    const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
    const [suggestionsColumn, setSuggestionsColumn] = useState<
      string | undefined
    >(undefined);

    const {
      toggleShouldShowDraftRows,
      toggleShouldShowPublishedRows,
      onShowNoRowsOverlay,
      onHideOverlay,
    } = useDataManagementPageUI();
    const selectedDraftRows = draftRowsData.filter(
      (row) => row._isDraftSelected
    );
    const selectedPublishedRowsCount = gridRef.current?.api
      ? gridRef.current?.api?.getSelectedRows().length
      : 0;
    const totalSelectedRowCount =
      selectedDraftRows.length + selectedPublishedRowsCount;
    let singleSelectedRowExternalId: string | undefined;
    if (totalSelectedRowCount === 1) {
      const selectedRow =
        selectedDraftRows[0] || gridRef.current?.api?.getSelectedRows()[0];
      singleSelectedRowExternalId = selectedRow.externalId;
    }

    const [isDeleteRowsModalVisible, setIsDeleteRowsModalVisible] =
      useState(false);

    const [isSuggestionsModalVisible, setIsSuggestionsModalVisible] =
      useState(false);

    const {
      data: publishedRowsCountMap,
      refetch: refetchPublishedRowsCountMap,
      isFetched: isPublishedRowsCountMapFetched,
    } = usePublishedRowsCountMapByType({
      dataModelExternalId,
      dataModelTypes: dataModelTypeDefs.types,
    });
    const deleteRowsMutation = useNodesDeleteMutation({
      dataModelExternalId,
      dataModelType,
    });

    const [sidebarData, setSidebarData] = useState<DataPreviewSidebarData>();

    const handleRowPublish = (row: KeyValueMap) => {
      dataManagementHandler
        .ingestNodes({
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: [sanitizeRow(row)],
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        })
        .then(({ items }) => {
          removeDrafts(items.map((item) => item.externalId as string));
          refetchPublishedRowsCountMap().then(() => {
            gridRef.current?.api.refreshInfiniteCache();
          });
          Notification({
            type: 'success',
            message: t('ingest_success_title', 'Instance added'),
          });
        });
    };

    const handleSuggestionsClose = async (selectedColumn?: string) => {
      gridRef.current?.api.refreshInfiniteCache();
      setIsSuggestionsModalVisible(false);
      setSuggestionsColumn(selectedColumn);
    };

    // set gridConfig in state so the reference is stable and doesn't cause rerenders
    const [gridConfig] = useState<GridConfig>(
      buildGridConfig(
        instanceIdCol,
        dataModelType,
        handleRowPublish,
        isDeletionEnabled,
        isManualPopulationEnabled
      )
    );

    const isNoRowsOverlayVisible = useMemo(
      () =>
        draftRowsData.length === 0 &&
        (publishedRowsCountMap?.[dataModelType.name] || 0) === 0,
      [draftRowsData.length, publishedRowsCountMap, dataModelType]
    );

    useEffect(() => {
      if (isNoRowsOverlayVisible && onShowNoRowsOverlay.current) {
        onShowNoRowsOverlay.current();
      } else if (onHideOverlay.current) {
        onHideOverlay.current();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNoRowsOverlayVisible]);

    useImperativeHandle(
      ref,
      () => {
        return {
          purgeInfiniteCache: () => {
            gridRef.current?.api.purgeInfiniteCache();
          },
        };
      },
      [gridRef]
    );

    const listDataSource = useListDataSource({
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion: selectedDataModelVersion,
      limit: pageSizeLimit,
      onError: (error) => {
        setFetchError(error);

        Notification({
          type: 'error',
          message: error.message,
        });
      },
      onSuccess: (items) => {
        /*
        This conditional is for the case where the aggregation
        is only returning 0s due to the syncer issue. Remove below code
        when the syncer issue is resolved.
        */
        if (items.length > 0 && onHideOverlay.current) {
          onHideOverlay.current();
        }
        setSuggestionsAvailable(
          getSuggestionsAvailable({
            dataModelType,
            previewData: items,
          })
        );
      },
    });

    const onGridReady = useCallback(
      (grid: GridReadyEvent) => {
        onShowNoRowsOverlay.current = () => grid.api.showNoRowsOverlay();
        onHideOverlay.current = () => grid.api.hideOverlay();
        grid.api.setDatasource(listDataSource);

        if (isNoRowsOverlayVisible) {
          onShowNoRowsOverlay.current();
        } else {
          onHideOverlay.current();
        }
      },
      [
        listDataSource,
        isNoRowsOverlayVisible,
        onHideOverlay,
        onShowNoRowsOverlay,
      ]
    );

    const prevDraftRowsLength = useRef(draftRowsData.length);

    useEffect(() => {
      gridRef.current?.api.onFilterChanged();
    }, [searchTerm]);

    const debouncedHandleSearchInputValueChange = debounce((value) => {
      setSearchTerm(value);
    }, 300);

    useEffect(() => {
      return () => {
        debouncedHandleSearchInputValueChange.cancel();
      };
    }, [debouncedHandleSearchInputValueChange]);

    const handlePinnedRowDataChanged = (event: RowDataUpdatedEvent) => {
      if (draftRowsData.length > prevDraftRowsLength.current) {
        const firstEditableColName = event.api
          .getColumnDefs()
          ?.filter((col: ColDef) => col.editable)
          .map((col: ColDef) => col.field!)[0];
        if (firstEditableColName) {
          event.api.setFocusedCell(0, firstEditableColName, 'top');
          event.api.startEditingCell({
            rowPinned: 'top',
            rowIndex: 0,
            colKey: firstEditableColName,
          });
        }
      }
      prevDraftRowsLength.current = draftRowsData.length;
    };

    const handleCellEditingStarted = (e: CellEditingStartedEvent) => {
      const fieldName = e.colDef.field || '';
      const fieldType = dataModelType?.fields?.find(
        (field) => field.name === fieldName
      );
      const isListTypeCell = fieldType?.list || fieldType?.type.list;

      if (!e.colDef.field) {
        throw Error('Attempting to edit cell without field value');
      }

      if (isListTypeCell) {
        e.api.stopEditing();
      }
    };

    const handleCellDoubleClicked = useCallback(
      (event: CellDoubleClickedEvent) => {
        if (!event.colDef.field) {
          return;
        }
        const fieldType = dataModelType.fields.find(
          (field) => field.name === event.colDef.field
        );

        // externalID for example is not in the dataModelType.fields
        if (!fieldType) {
          return;
        }

        const handleColumnVisibility = () => {
          // 400ms is animation time of side panel opening
          window.setTimeout(() => {
            event.colDef.field &&
              event.api.ensureColumnVisible(event.colDef.field);
          }, 400);
        };

        if (fieldType.type.list) {
          const isCustomListTypeCell = fieldType.type.custom;

          const cellData = event.value.map((item: any) =>
            isCustomListTypeCell ? item.externalId : item
          );

          setSidebarData({
            value: cellData,
            fieldName: event.colDef.field,
            type: 'list',
          });

          handleColumnVisibility();
        } else if (fieldType.type.custom) {
          const targetFieldType = dataModelTypeDefs.types.find(
            (type) => type.name === fieldType.type.name
          );
          if (!event.value) {
            setSidebarData(undefined);
          } else if (targetFieldType) {
            setSidebarData({
              externalId: event.value,
              fieldName: event.colDef.field,
              fieldType: targetFieldType,
              type: 'custom',
            });
          }
          handleColumnVisibility();
        } else {
          setSidebarData(undefined);
        }
      },
      [dataModelType, dataModelTypeDefs.types]
    );
    /*
  We use this value-setter to handle editing of pinned draft rows and published rows.
  The alternative of using readOnlyEdit and onCellEditRequest doesn't give us a good
  way to handle editing of a published row without seeing the old value for a split
  second before seeing the new value.

  Since ag-grid's value setter needs to return a boolean, we handle an async edit of a
  published row by first returning true, which in effect does an optimistic update, and
  then after our API call promise resolves, we simply update the react-query cache on
  success to ensure our cache has up-to-date data. On failure, we revert the grid cell's
  data and call refreshCells to ensure the cell rerenders.

  Technique borrowed from https://stackoverflow.com/a/64294316
  */
    const handleCellValueChanged = (e: ValueSetterParams) => {
      if (!e.colDef.field || !isManualPopulationEnabled) {
        return false;
      }

      let newValue = e.newValue;
      if (
        // if is a relationship and value not null
        dataModelType.fields.some(
          (el) => el.name === e.colDef.field && el.type.custom
        ) &&
        e.newValue !== null
      ) {
        // Set to null if externalId is set to empty string
        newValue = e.newValue === '' ? null : { externalId: e.newValue.trim() };
      }

      if (e.node?.rowPinned === 'top') {
        // if draft row, update redux store and return true
        updateRowData({
          field: e.colDef.field,
          newValue: newValue,
          row: e.data as DraftRowData,
        });
        return true;
      }

      // update ag-grid cell data
      e.data[e.colDef.field] = newValue;

      const updatedRowData = {
        ...e.data,
      };

      dataManagementHandler
        .ingestNodes({
          /*
        PG3 does not currently set a value to null if we pass null when doing a partial
        update (overwrite: false), but rather it will ignore that value. Therefore in
        order to be able to set values to null we need overwrite: true
        */
          overwrite: true,
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: [updatedRowData],
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        })
        .then(() => {
          gridRef.current?.api.refreshCells();
          if (e.colDef.field) {
            e.api.refreshCells({ columns: [e.column], rowNodes: [e.node!] });
          }
          const data: KeyValueMap[] = [];
          gridRef.current?.api.forEachNode((el) => data.push(el.data));
          setSuggestionsAvailable(
            getSuggestionsAvailable({
              dataModelType,
              previewData: data,
            })
          );
        })
        .catch((error: PlatypusError) => {
          Notification({
            type: 'error',
            message: error.message,
          });

          if (e.colDef.field) {
            // revert data and rerender cell
            e.data[e.colDef.field] = e.oldValue;
            e.api.refreshCells({ columns: [e.column], rowNodes: [e.node!] });
          }
        });

      return true;
    };

    /*
  Listen to selection changed event and keep the count in state so that we rerender
  when necessary to enable/disable the delete button
  */
    const handleSelectionChanged = useCallback(() => {
      setSelectedPublishedRowsCount(
        gridRef.current?.api.getSelectedRows().length || 0
      );
    }, []);

    const handleDeleteRows = useCallback(() => {
      const selectedRows = gridRef.current?.api.getSelectedRows() || [];
      const dto: DeleteInstancesDTO = {
        type: 'node',
        dataModelExternalId,
        space,
        items: selectedRows.map((row) => ({ externalId: row.externalId })),
      };

      deleteRowsMutation.mutate(dto, {
        onSettled: (result, error) => {
          let isError = false;
          let errorMessage = '';

          if (error) {
            isError = true;
            errorMessage = error.message;
          }

          if (result?.isFailure) {
            isError = true;
            errorMessage = result.error.message;
          }

          if (isError) {
            Notification({
              type: 'error',
              message: errorMessage,
            });
            setIsDeleteRowsModalVisible(false);
            return;
          }

          gridRef.current?.api.refreshInfiniteCache();
          // We have to manually deselect rows
          // https://github.com/ag-grid/ag-grid/issues/4161
          gridRef.current?.api.deselectAll();

          // Delete draft rows
          deleteSelectedRows();

          let successNotificationMessage;

          if (singleSelectedRowExternalId) {
            successNotificationMessage = `${singleSelectedRowExternalId} ${t(
              'row-deletion-success-msg',
              'deleted'
            )}`;
          } else {
            successNotificationMessage = t(
              'row-deletion-success-msg',
              'Instances deleted'
            );
          }

          Notification({
            type: 'success',
            message: successNotificationMessage,
          });
          setIsDeleteRowsModalVisible(false);
          refetchPublishedRowsCountMap({ exact: true, cancelRefetch: true });
        },
      });
    }, [
      dataModelExternalId,
      deleteRowsMutation,
      deleteSelectedRows,
      singleSelectedRowExternalId,
      refetchPublishedRowsCountMap,
      t,
      space,
    ]);

    if (!isPublishedRowsCountMapFetched) {
      return <Spinner />;
    }

    if (fetchError) {
      return (
        <FlexPlaceholder
          data-cy="data-preview-error"
          title={t('error-loading-data-title', 'Unable to load the preview')}
          description={t(
            'error-loading-data-body',
            'Something went wrong and we were notified about it. The data preview can not be created for this type. Please try to refresh the page or select another type.'
          )}
        />
      );
    }

    return (
      <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
        {totalSelectedRowCount > 0 && (
          <DeleteRowsModal
            isVisible={isDeleteRowsModalVisible}
            isDeleting={deleteRowsMutation.isLoading}
            singleRowExternalId={singleSelectedRowExternalId}
            onCancel={() => setIsDeleteRowsModalVisible(false)}
            onDelete={handleDeleteRows}
          />
        )}
        {isTransformationModalVisible && (
          <CreateTransformationModal
            dataModelExternalId={dataModelExternalId}
            dataModelType={dataModelType}
            onRequestClose={() => setIsTransformationModalVisible(false)}
            version={version}
          />
        )}
        {isSuggestionsModalVisible && isSuggestionsEnabled && (
          <SuggestionsModal
            defaultColumn={suggestionsColumn}
            onCancel={handleSuggestionsClose}
            onConfirm={handleSuggestionsClose}
            dataModelInfo={{
              dataModelType,
              dataModelTypeDefs,
              dataModelExternalId,
              version,
              space,
            }}
          />
        )}
        <PreviewPageHeader
          dataModelExternalId={dataModelExternalId}
          draftRowsCount={draftRowsData.length}
          isDeleteButtonDisabled={
            totalSelectedRowCount === 0 || deleteRowsMutation.isLoading
          }
          onAddTransformationClick={() => setIsTransformationModalVisible(true)}
          onCreateClick={createNewDraftRow}
          onDeleteClick={() => {
            setIsDeleteRowsModalVisible(true);
          }}
          onDraftRowsCountClick={toggleShouldShowDraftRows}
          onPublishedRowsCountClick={toggleShouldShowPublishedRows}
          onSearchInputValueChange={debouncedHandleSearchInputValueChange}
          publishedRowsCount={publishedRowsCountMap?.[dataModelType.name] || 0}
          shouldShowDraftRows={shouldShowDraftRows}
          shouldShowPublishedRows={shouldShowPublishedRows}
          title={dataModelType.name}
          onSuggestionsClick={() => setIsSuggestionsModalVisible(true)}
          suggestionsAvailable={suggestionsAvailable}
          typeName={dataModelType.name}
          version={version}
        />
        <CollapsiblePanelContainer
          data={sidebarData}
          onClose={() => setSidebarData(undefined)}
          dataModelTypeName={dataModelType.name}
          dataModelExternalId={dataModelExternalId}
        >
          <StyledDataPreviewTable data-cy="data-preview-table">
            <CogDataGrid
              ref={gridRef}
              gridOptions={{
                alwaysMultiSort: false,
                readOnlyEdit: !isManualPopulationEnabled,
                enableCellChangeFlash: true,
                rowModelType: 'infinite',
                rowBuffer: pageSizeLimit / 2,
                // how big each page in our page cache will be, default is 100
                cacheBlockSize: pageSizeLimit,
                // this needs to be 1 since we use cursor-based pagination
                maxConcurrentDatasourceRequests: 1,
                noRowsOverlayComponent: () => (
                  <NoRowsOverlay
                    dataModelExternalId={dataModelExternalId}
                    onLoadDataClick={() =>
                      setIsTransformationModalVisible(true)
                    }
                    typeName={dataModelType.name}
                    version={version}
                  />
                ),
                context: {
                  dataModelExternalId,
                  dataModelType,
                  dataModelTypeDefs,
                  searchTerm,
                  version,
                },
                onCellEditingStarted: handleCellEditingStarted,
                onCellDoubleClicked: handleCellDoubleClicked,
              }}
              defaultColDef={{
                valueSetter: handleCellValueChanged,
              }}
              rowSelection="multiple"
              rowNodeId={instanceIdCol}
              config={gridConfig}
              suppressRowClickSelection
              rowMultiSelectWithClick={false}
              rowClassRules={{
                'ag-row-selected': (params) => params.data?._isDraftSelected,
              }}
              onGridReady={onGridReady}
              pinnedTopRowData={draftRowsData}
              onPinnedRowDataChanged={handlePinnedRowDataChanged}
              onSelectionChanged={handleSelectionChanged}
              shouldShowDraftRows={shouldShowDraftRows}
              shouldShowPublishedRows={shouldShowPublishedRows}
            />
          </StyledDataPreviewTable>
        </CollapsiblePanelContainer>
      </ErrorBoundary>
    );
  }
);
