import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chart,
  ChartWorkflow,
  FunctionCallStatus,
  ChartTimeSeries,
  Call,
} from 'reducers/charts/types';
import { useDebounce } from 'use-debounce';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';
import FunctionCall from 'components/FunctionCall';
import { updateWorkflow, removeWorkflow } from 'utils/charts';
import EditableText from 'components/EditableText';
import { useCallFunction, useFunctionCall } from 'utils/backendService';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { isWorkflowRunnable } from 'components/NodeEditor/utils';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { UnitDropdown } from 'components/UnitDropdown';
import { getHash } from 'utils/hash';
import { DraggableProvided } from 'react-beautiful-dnd';
import { flow, isEqual } from 'lodash';
import { convertValue } from 'utils/units';
import {
  SourceItem,
  SourceSquare,
  SourceName,
  SourceRow,
  SourceDescription,
} from './elements';
import WorkflowMenu from './WorkflowMenu';

const renderStatusIcon = (status?: FunctionCallStatus) => {
  switch (status) {
    case 'Running':
      return <Icon type="Loading" />;
    case 'Completed':
      return <Icon type="Checkmark" />;
    case 'Failed':
    case 'Timeout':
      return <Icon type="Close" />;
    default:
      return null;
  }
};

type Props = {
  chart: Chart;
  workflow: ChartWorkflow;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  mutate: (update: (c: Chart | undefined) => Chart) => void;
  draggable?: boolean;
  provided?: DraggableProvided | undefined;
};
export default function WorkflowRow({
  chart,
  workflow,
  onRowClick = () => {},
  onInfoClick = () => {},
  mode,
  openNodeEditor = () => {},
  isSelected = false,
  mutate,
  draggable = false,
  provided = undefined,
}: Props) {
  const { mutate: callFunction, isLoading: isCallLoading } =
    useCallFunction('simple_calc-master');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [lastSuccessfulCall, setLastSuccessfulCall] = useState<Call>();
  const { id, enabled, color, name, calls, unit, preferredUnit } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];
  const isWorkspaceMode = mode === 'workspace';

  const update = (wfId: string, diff: Partial<ChartWorkflow>) => {
    mutate((oldChart) => updateWorkflow(oldChart!, wfId, diff));
  };

  const { nodes, connections } = workflow;
  const steps = useMemo(
    () =>
      isWorkflowRunnable(nodes)
        ? getStepsFromWorkflow(chart, nodes, connections)
        : [],
    [chart, nodes, connections]
  );

  const [{ dateFrom, dateTo }] = useDebounce(
    { dateFrom: chart.dateFrom, dateTo: chart.dateTo },
    2000,
    {
      equalityFn: isEqual,
    }
  );

  const computation = useMemo(
    () => ({
      steps,
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      granularity: calculateGranularity(
        [new Date(dateFrom).getTime(), new Date(dateTo).getTime()],
        1000
      ),
    }),
    [steps, dateFrom, dateTo]
  );

  const runComputation = useCallback(() => {
    callFunction(
      {
        data: { computation_graph: computation },
      },
      {
        onSuccess(res) {
          setLastSuccessfulCall(res);
        },
      }
    );
  }, [computation, callFunction, setLastSuccessfulCall]);

  const currentCallStatus = useFunctionCall(call?.functionId!, call?.callId!);

  const handleRetries = useCallback(() => {
    if (isCallLoading) {
      return;
    }

    if (!call) {
      return;
    }

    if (!currentCallStatus.isError) {
      return;
    }

    if (
      currentCallStatus.data?.status &&
      !['Failed', 'Timeout'].includes(currentCallStatus.data.status)
    ) {
      return;
    }

    runComputation();
  }, [call, currentCallStatus, runComputation, isCallLoading]);

  const handleChanges = useCallback(() => {
    if (!computation.steps.length) {
      return;
    }

    if (call?.hash === getHash(computation)) {
      return;
    }

    runComputation();
  }, [computation, runComputation, call]);

  const handleCallUpdates = useCallback(() => {
    if (!computation) {
      return;
    }
    if (!lastSuccessfulCall) {
      return;
    }
    if (call?.callId === lastSuccessfulCall.callId) {
      return;
    }

    const newCall = {
      ...lastSuccessfulCall,
      callDate: Date.now(),
      hash: getHash(computation),
    };

    mutate((oldChart) =>
      updateWorkflow(oldChart!, workflow.id, {
        calls: [newCall],
      })
    );
  }, [workflow.id, mutate, computation, lastSuccessfulCall, call]);

  useEffect(handleRetries, [handleRetries]);
  useEffect(handleChanges, [handleChanges]);
  useEffect(handleCallUpdates, [handleCallUpdates]);

  const remove = () => mutate((oldChart) => removeWorkflow(oldChart!, id));

  const updateUnit = (unitOption: any) => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;
    const nextInputUnit = unitOption?.value;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];
    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const convertFromTo =
      (inputUnit?: string, outputUnit?: string) => (value: number) =>
        convertValue(value, inputUnit, outputUnit);

    const convert = flow(
      convertFromTo(currentOutputUnit, currentInputUnit),
      convertFromTo(nextInputUnit, currentOutputUnit)
    );

    const range = hasValidRange ? [convert(min!), convert(max!)] : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      unit: unitOption.value,
      range,
    });
  };

  const updatePrefferedUnit = (unitOption: any) => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;
    const nextOutputUnit = unitOption?.value;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];

    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const convertFromTo =
      (inputUnit?: string, outputUnit?: string) => (value: number) =>
        convertValue(value, inputUnit, outputUnit);

    const convert = flow(
      convertFromTo(currentOutputUnit, currentInputUnit),
      convertFromTo(currentInputUnit, nextOutputUnit)
    );

    const range = hasValidRange ? [convert(min!), convert(max!)] : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      preferredUnit: unitOption?.value,
      range,
    });
  };

  const resetUnit = async () => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];
    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const range = hasValidRange
      ? [
          convertValue(min!, currentOutputUnit, currentInputUnit),
          convertValue(max!, currentOutputUnit, currentInputUnit),
        ]
      : [];

    /**
     * Update units and corresponding converted range
     */
    update(id, {
      unit: '',
      preferredUnit: '',
      range,
    });
  };

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => updateWorkflow(oldChart!, id, diff));

  return (
    <SourceRow
      onClick={() => onRowClick(id)}
      className={isSelected ? 'active' : undefined}
      onDoubleClick={openNodeEditor}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <td>
        <SourceItem key={id}>
          <SourceSquare
            onClick={(event) => {
              event.stopPropagation();
              update(id, {
                enabled: !enabled,
              });
            }}
            color={color}
            fade={!enabled}
          />
          {call && (
            <div
              style={{
                marginRight: 10,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FunctionCall
                id={call.functionId}
                callId={call.callId}
                renderLoading={() => renderStatusIcon('Running')}
                renderCall={({ status }) => renderStatusIcon(status)}
              />
            </div>
          )}
          <SourceName>
            <EditableText
              value={name || 'noname'}
              onChange={(value) => {
                update(id, { name: value });
                setIsEditingName(false);
              }}
              onCancel={() => setIsEditingName(false)}
              editing={isEditingName}
              hideButtons
            />
          </SourceName>
        </SourceItem>
      </td>
      {isWorkspaceMode && (
        <>
          <td>
            <SourceName>
              <SourceDescription>
                <Tooltip content={name || 'noname'}>
                  <>{name || 'noname'}</>
                </Tooltip>
              </SourceDescription>
            </SourceName>
          </td>
          <td colSpan={4} />
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <UnitDropdown
              unit={unit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
            />
          </td>
          <td className="downloadChartHide" />
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Dropdown
              content={<AppearanceDropdown update={updateAppearance} />}
            >
              <Button
                type="ghost"
                icon="ResourceTimeseries"
                style={{ height: 28 }}
                aria-label="timeseries"
              />
            </Dropdown>
          </td>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Popconfirm
              onConfirm={remove}
              okText="Remove"
              content={
                <div style={{ textAlign: 'left' }}>
                  Remove this calculation?
                </div>
              }
            >
              <Button
                type="ghost"
                icon="Trash"
                style={{ height: 28 }}
                aria-label="delete"
              />
            </Popconfirm>
          </td>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Button
              type="ghost"
              icon="Info"
              onClick={(event) => {
                if (isSelected) {
                  event.stopPropagation();
                }
                onInfoClick(id);
              }}
              style={{ height: 28 }}
              aria-label="info"
            />
          </td>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Dropdown
              content={
                <WorkflowMenu chart={chart} id={id}>
                  <Menu.Item onClick={openNodeEditor} appendIcon="Function">
                    <span>Edit calculation</span>
                  </Menu.Item>
                </WorkflowMenu>
              }
            >
              <Button
                type="ghost"
                icon="MoreOverflowEllipsisHorizontal"
                style={{ height: 28 }}
                aria-label="more"
              />
            </Dropdown>
          </td>
        </>
      )}
    </SourceRow>
  );
}
