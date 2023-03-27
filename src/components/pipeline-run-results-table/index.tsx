import { useState } from 'react';

import { EMPipelineRun } from 'hooks/entity-matching-pipelines';
import { Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import PipelineResultsTable from './PipelineResultsTable';

type PipelineRunResultsTableProps = {
  run: EMPipelineRun;
};

const PipelineRunResultsTable = ({
  run,
}: PipelineRunResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [shouldGroupByPattern, setShouldGroupByPattern] = useState(false);

  return (
    <Flex direction="column" gap={16}>
      <Flex>
        <Checkbox
          disabled={!run.generatedRules || run.generatedRules.length === 0}
          label={t('group-by-pattern')}
          checked={shouldGroupByPattern}
          onChange={(e) => setShouldGroupByPattern(e.target.checked)}
        />
      </Flex>
      <PipelineResultsTable run={run} />
    </Flex>
  );
};

export default PipelineRunResultsTable;
