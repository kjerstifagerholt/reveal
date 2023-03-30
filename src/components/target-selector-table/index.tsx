import { Checkbox, Flex } from '@cognite/cogs.js';
import { useSearchParams } from 'react-router-dom';
import { TARGET_TABLE_QUERY_KEY } from 'common/constants';
import AssetTable from 'components/source-selector-table/AssetTable';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { getAdvancedFilter } from 'utils';
import { useMemo } from 'react';
import ResourceCount from 'components/resource-count';
import { DataSetSelect } from 'components/data-set-select';
import SearchInput from 'components/search-input';
import { useTranslation } from 'common';
import RootAssetSelect from 'components/root-asset-select';
import QuickMatchActionBar from 'components/qm-action-bar/QuickMatchActionbar';
import styled from 'styled-components';

type Props = {};

export default function TargetSelectionTable({}: Props) {
  const {
    targetsList,
    setTargetsList,
    targetFilter,
    setTargetFilter,
    allTargets,
    setAllTargets,
  } = useQuickMatchContext();
  const { t } = useTranslation();
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const query = searchParams.get(TARGET_TABLE_QUERY_KEY);
  const advancedFilter = useMemo(
    () => getAdvancedFilter({ api: 'assets', query }),
    [query]
  );

  const onClose = () => setTargetsList([]);

  return (
    <Container $isActionBarVisible={!!targetsList.length}>
      <Flex direction="column">
        <Flex justifyContent="space-between">
          <Flex gap={12} alignItems="center">
            <DataSetSelect
              api="assets"
              onChange={(id?: number) => {
                setTargetFilter({
                  ...targetFilter,
                  dataSetIds: !!id ? [{ id }] : undefined,
                });
              }}
              selected={targetFilter.dataSetIds?.[0]?.id}
            />
            <RootAssetSelect
              onChange={(id) => {
                setTargetFilter({
                  ...targetFilter,
                  assetSubtreeIds: !!id ? [{ id }] : undefined,
                });
              }}
            />
            <SearchInput
              disabled={allTargets}
              value={query || ''}
              placeholder={t('filter-by-name-placeholder')}
              onChange={(e) => {
                searchParams.set(TARGET_TABLE_QUERY_KEY, e.target.value);
                setSearchParams(searchParams);
              }}
              icon="Search"
            />
          </Flex>
          <Flex alignItems="center" gap={12}>
            <ResourceCount
              type="assets"
              filter={targetFilter}
              advancedFilter={advancedFilter}
            />
            <Checkbox
              checked={!query && allTargets}
              disabled={!!query}
              onChange={(e) => setAllTargets(e.target.checked)}
              label="Select all"
            />
          </Flex>
        </Flex>
        <AssetTable
          filter={targetFilter}
          selected={targetsList}
          setSelected={setTargetsList}
          advancedFilter={advancedFilter}
          allSources={allTargets}
        />
      </Flex>
      <QuickMatchActionBar
        selectedRows={targetsList}
        sourceType="assets"
        onClose={onClose}
      />
    </Container>
  );
}

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
