import { Chart, ChartWorkflowV2 } from 'models/chart/types';
import { updateWorkflow } from 'models/chart/updates';
import { useCallback } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Icon, toast } from '@cognite/cogs.js';
import { SetterOrUpdater } from 'recoil';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useIsChartOwner } from 'hooks/user';
import { SourceOption } from './V2/types';
import { useAvailableOps } from './AvailableOps';
import { getSourceOption, getSourcesFromChart } from './utils';
import ReactFlowNodeEditorContainer from './V2/ReactFlowNodeEditorContainer';
import { defaultTranslations } from './translations';

interface Props {
  chart: Chart;
  workflowId: string;
  onClose: () => void;
  setChart: SetterOrUpdater<Chart | undefined>;
  translations: typeof defaultTranslations;
}

const NodeEditor = ({
  workflowId,
  chart,
  onClose,
  setChart,
  translations,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };
  /**
   * This could be done using a selector
   */
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  ) as ChartWorkflowV2;

  const { data: login } = useUserInfo();
  const isOwner = useIsChartOwner(chart);

  /**
   * Get all operations
   */
  const [isLoadingOperations, operationsError, operations = []] =
    useAvailableOps();

  /**
   * Generate all source options
   */
  const sources: SourceOption[] = getSourcesFromChart(chart)
    .filter(({ id }) => id !== workflowId)
    .map((source) => {
      return getSourceOption(source);
    });

  /**
   * Generate update function for workflow
   */
  const handleUpdateWorkflow = useCallback(
    (wf: ChartWorkflowV2) => {
      setChart((oldChart) => {
        return updateWorkflow(oldChart!, workflowId, wf);
      });
    },
    [setChart, workflowId]
  );

  const readOnly = Boolean(login?.id && !isOwner);

  if (operationsError instanceof Error) {
    toast.error(
      <ErrorToast
        title={t['Failed to load Operations']}
        text={t['Please reload the page']}
      />
    );
  }

  if (isLoadingOperations) {
    return <Icon type="Loader" />;
  }

  const referenceableWorkflows = (chart.workflowCollection || []).filter(
    ({ version }) => version === 'v2'
  ) as ChartWorkflowV2[];

  return (
    <ReactFlowProvider>
      <ReactFlowNodeEditorContainer
        workflow={workflow}
        workflows={referenceableWorkflows}
        operations={operations}
        sources={sources}
        onClose={onClose}
        onUpdateWorkflow={handleUpdateWorkflow}
        readOnly={readOnly}
        translations={t}
      />
    </ReactFlowProvider>
  );
};

NodeEditor.translationKeys = Object.keys(defaultTranslations);

export default NodeEditor;
