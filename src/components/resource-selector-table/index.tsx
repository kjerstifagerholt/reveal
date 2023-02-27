import { Flex } from '@cognite/cogs.js';
import { Select, Input } from 'antd';
import { useTranslation } from 'common';
import { SOURCE_TABLE_QUERY_KEY } from '../../constants';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { useAllDataSets } from 'hooks/datasets';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TimeseriesTable from './TimeSeriesTable';

const { Option } = Select;

type Props = {};

export default function ResourceSelectionTable({}: Props) {
  const { t } = useTranslation();
  const { sourceType, setSourcesList, sourcesList } = useQuickMatchContext();
  const resourceTypeOptions = [
    { value: 'timeseries', label: t('resource-type-ts') },
  ];
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;
  const { data, isInitialLoading } = useAllDataSets();
  const datasets = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, p) => [
          ...accl,
          ...p.items.map(({ id, name }) => ({
            value: id,
            label: name || id.toString(),
          })),
        ],
        [] as { label: string; value: string | number }[]
      ) || [],
    [data?.pages]
  );
  return (
    <Flex direction="column">
      <Flex direction="row" gap={12}>
        <Select style={{ width: 120 }} defaultValue="timeseries">
          {resourceTypeOptions.map(({ value, label }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>

        <Select
          placeholder={t('resource-type-datasets')}
          style={{ width: 120 }}
          loading={isInitialLoading}
          options={datasets}
        />
        <Input.Search
          style={{ width: 120 }}
          value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
          onChange={(e) => {
            searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
        />
      </Flex>
      {sourceType === 'timeseries' && (
        <TimeseriesTable
          query={searchParams.get(SOURCE_TABLE_QUERY_KEY)}
          selected={sourcesList}
          setSelected={setSourcesList}
        />
      )}
    </Flex>
  );
}
