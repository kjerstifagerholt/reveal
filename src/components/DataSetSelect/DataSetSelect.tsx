import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Select } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';
import { Popover, Spin } from 'antd';
import {
  list,
  selectAllDataSets,
  dataSetCounts,
  getIsFetchingDatasets,
  datasetsFetched,
} from 'modules/datasets';
import { ResourceType } from 'modules/sdk-builder/types';
import { stringContains } from 'modules/contextualization/utils';

type OptionsType = {
  label: number | string;
  value: number | string;
};
type Props = {
  isMulti?: boolean;
  resourceType: ResourceType;
  noTypeCheck?: boolean;
  selectedDataSetIds?: number[];
  onDataSetSelected: (ids: number[]) => void;
};

export default function DataSetSelect({
  noTypeCheck = false,
  resourceType,
  selectedDataSetIds,
  onDataSetSelected,
}: Props) {
  const dispatch = useDispatch();
  const [currentSelection, setCurrentSelection] = useState([] as OptionsType[]);
  const [query, setQuery] = useState('');
  const [datasetSearchResults, setDatasetSearchResults] = useState(
    [] as DataSet[]
  );
  const datasets = useSelector(selectAllDataSets);
  const dataSetResourceCounts = useSelector(dataSetCounts);
  const isLoading = useSelector(getIsFetchingDatasets);
  const isLoaded = useSelector(datasetsFetched);
  const { data: canReadDataSets } = usePermissions('datasetsAcl', 'READ');

  const setSelectedValue = (items?: OptionsType[]) => {
    if (!items?.length) {
      setCurrentSelection([]);
      onDataSetSelected([]);
    } else {
      setCurrentSelection(items);
      onDataSetSelected(
        items.map((item: OptionsType) => item.value) as number[]
      );
    }
    setQuery('');
  };

  const options = datasetSearchResults.map(
    (dataset: DataSet): OptionsType => ({
      label: dataset?.name ?? dataset.externalId ?? dataset?.id,
      value: dataset?.id,
    })
  );

  const styles = {
    container: (original: any) => ({
      ...original,
      flex: 1,
    }),
  };

  useEffect(() => {
    if (!selectedDataSetIds) return;
    const fixedDataSets = selectedDataSetIds.map((id: number) => ({
      label:
        options.find((dataSetOption: OptionsType) => dataSetOption.value === id)
          ?.label ?? id,
      value: id,
    }));
    const shouldSelectionUpdate = !isEqual(fixedDataSets, currentSelection);
    if (shouldSelectionUpdate) setCurrentSelection(fixedDataSets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataSetIds]);

  useEffect(() => {
    const dataSetsFilter = (dataset: DataSet) => {
      const containsQuery = stringContains(dataset?.name, query);
      const containsData = dataSetResourceCounts[dataset.id][resourceType] > 0;
      return resourceType && containsQuery && containsData;
    };
    const filter = datasets.filter(dataSetsFilter);
    setDatasetSearchResults(filter);
  }, [query, datasets, resourceType, dataSetResourceCounts, noTypeCheck]);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(list({}));
    }
  }, [dispatch, isLoaded]);

  return (
    <div style={{ minWidth: '250px' }}>
      <Spin spinning={!!isLoading} size="small">
        {canReadDataSets ? (
          <Select
            isMulti
            title="Data sets"
            placeholder=""
            options={options}
            value={currentSelection}
            onChange={setSelectedValue}
            styles={styles}
          />
        ) : (
          <Popover
            title="Missing DataSetAcl.READ"
            content="Go to Access management to enable access to DataSetAcl.READ"
          >
            <Select disabled />
          </Popover>
        )}
      </Spin>
    </div>
  );
}
