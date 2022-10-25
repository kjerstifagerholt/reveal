import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
  ExploreDataFilters,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';

interface filesTableProps {
  dataSetId: number;
  query: string;
  filters: ExploreDataFilters;
}

const FilesTable = ({ dataSetId, query, filters }: filesTableProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: files, isLoading: isFilesLoading } = useQuery(
    getResourceSearchQueryKey('files', dataSetId, query, filters),
    () =>
      sdk.files.search(
        getResourceSearchParams(dataSetId, query, filters, 'name')
      ),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-files-failed'), ...e });
      },
    }
  );

  return (
    <ContentView id="filesTableId">
      <Table
        rowKey="key"
        loading={isFilesLoading}
        columns={[...getResourceTableColumns('files')]}
        dataSource={files || []}
        onChange={(_pagination, _filters) => {
          // TODO: Implement sorting
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('no-records')}
            content={t('no-search-records', {
              $: '',
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </ContentView>
  );
};

export default FilesTable;
