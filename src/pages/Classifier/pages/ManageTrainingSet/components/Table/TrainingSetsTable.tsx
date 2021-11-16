import { Button, Loader, Table } from '@cognite/cogs.js';
import TableBulkActions from 'components/BulkAction';
import { PageContent } from 'components/page';
import { Empty } from 'components/states/Empty';
import { useNavigation } from 'hooks/useNavigation';
import React from 'react';
import { useClassifierManageTrainingSetsQuery } from 'services/query/classifier/query';
import { useDocumentsUpdatePipelineMutate } from 'services/query/documents/mutate';
import { ClassifierTrainingSet } from 'services/types';
import { StickyTableHeadContainer } from 'styles/elements';
import { curateColumns } from './curateTrainingSetsColumns';

export const TrainingSetsTable: React.FC = () => {
  const [selectedTrainingSets, setSelectedTrainingSets] = React.useState<
    ClassifierTrainingSet[]
  >([]);

  const { data, isLoading } = useClassifierManageTrainingSetsQuery();
  const { mutateAsync } = useDocumentsUpdatePipelineMutate('remove');

  const navigate = useNavigation();
  const columns = React.useMemo(() => curateColumns(navigate), [navigate]);

  const handleRemoveLabelsClick = () => {
    const labels = selectedTrainingSets.map(({ id }) => ({
      externalId: id,
    }));

    mutateAsync(labels);
  };

  const handleSectionChange = React.useCallback(
    (event: ClassifierTrainingSet[]) => {
      setSelectedTrainingSets(event);
    },
    []
  );

  const renderTable = React.useMemo(
    () => (
      <Table<ClassifierTrainingSet>
        onSelectionChange={handleSectionChange}
        pagination={false}
        filterable
        dataSource={data}
        columns={columns as any}
        rowKey={(d) => String(d.id)}
        locale={{ emptyText: <Empty /> }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, handleSectionChange]
  );

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <>
      <PageContent>
        <StickyTableHeadContainer>{renderTable}</StickyTableHeadContainer>
      </PageContent>
      <TableBulkActions
        isVisible={selectedTrainingSets.length > 0}
        title={`${selectedTrainingSets.length} labels selected`}
      >
        <Button
          type="secondary"
          icon="Trash"
          onClick={() => handleRemoveLabelsClick()}
        >
          Remove
        </Button>
      </TableBulkActions>
    </>
  );
};
