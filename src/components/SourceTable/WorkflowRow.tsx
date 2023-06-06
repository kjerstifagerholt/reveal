import { Button, Popconfirm, Tooltip } from '@cognite/cogs.js';
import AppearanceDropdown from 'components/AppearanceDropdown/AppearanceDropdown';
import UnitDropdown from 'components/UnitDropdown/UnitDropdown';
import { ComponentProps, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { ChartWorkflow } from 'models/chart/types';
import { DatapointsSummary } from 'utils/units';
import { StyleButton } from 'components/StyleButton/StyleButton';
import { useComponentTranslations, useTranslations } from 'hooks/translations';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import Dropdown from 'components/Dropdown/Dropdown';
import { trackUsage } from 'services/metrics';
import { formatValueForDisplay } from 'utils/numbers';
import { WorkflowState } from 'models/calculation-results/types';
import { getIconTypeFromStatus } from 'components/StatusIcon/StatusIcon';
import AlertIcon from 'components/AlertIcon/AlertIcon';
import { ScheduledCalculationModal } from 'components/ScheduledCalculation/ScheduledCalculationModal';
import {
  DropdownWithoutMaxWidth,
  SourceDescription,
  SourceItem,
  SourceName,
  SourceRow,
  SourceStatus,
  StyledStatusIcon,
  StyledVisibilityIcon,
} from './elements';

type Props = {
  workflow: ChartWorkflow;
  summary?: DatapointsSummary;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  onErrorIconClick?: (id: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  draggable?: boolean;
  provided?: DraggableProvided | undefined;
  translations: typeof defaultTranslations;
  calculationResult?: WorkflowState;
  onOverrideUnitClick?: ComponentProps<
    typeof UnitDropdown
  >['onOverrideUnitClick'];
  onConversionUnitClick?: ComponentProps<
    typeof UnitDropdown
  >['onConversionUnitClick'];
  onResetUnitClick?: ComponentProps<typeof UnitDropdown>['onResetUnitClick'];
  onCustomUnitLabelClick?: ComponentProps<
    typeof UnitDropdown
  >['onCustomUnitLabelClick'];
  onStatusIconClick?: () => void;
  onRemoveSourceClick?: () => void;
  onUpdateAppearance?: (diff: Partial<ChartWorkflow>) => void;
  onUpdateName?: (value: string) => void;
  onDuplicateCalculation?: () => void;
};

/**
 * Workflow translations
 */
const defaultTranslations = makeDefaultTranslations(
  'Remove',
  'Cancel',
  'Remove this calculation?',
  'Edit calculation',
  'Duplicate',
  'Threshold',
  'Save & Schedule'
);

function WorkflowRow({
  workflow,
  summary,
  onRowClick = () => {},
  onInfoClick = () => {},
  onErrorIconClick = () => {},
  mode,
  openNodeEditor = () => {},
  isSelected = false,
  draggable = false,
  provided = undefined,
  translations,
  calculationResult,
  onOverrideUnitClick = () => {},
  onConversionUnitClick = () => {},
  onResetUnitClick = () => {},
  onCustomUnitLabelClick = () => {},
  onStatusIconClick = () => {},
  onRemoveSourceClick = () => {},
  onUpdateAppearance = () => {},
  onUpdateName = () => {},
  onDuplicateCalculation = () => {},
}: Props) {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [sCModalVisible, setSCModalVisible] = useState<boolean>(false);
  const {
    id,
    enabled,
    color = '',
    lineStyle = 'solid',
    lineWeight = 1,
    interpolation = 'linear',
    name,
    calls,
    unit,
    preferredUnit,
    customUnitLabel,
  } = workflow;
  const call = [...(calls || [])].sort((c) => c.callDate)[0];
  const isWorkspaceMode = mode === 'workspace';
  const t = { ...defaultTranslations, ...translations };

  /**
   * Unit Dropdown translations
   */
  const unitDropdownTranslations = useComponentTranslations(UnitDropdown);

  const resultError = calculationResult?.error;
  const hasError = !!resultError;
  const resultWarning = calculationResult?.warnings;
  const hasWarning = resultWarning && resultWarning.length > 0;
  const isVisible = enabled;
  const status = calculationResult?.status;

  return (
    <>
      <SourceRow
        onClick={() => onRowClick(id)}
        aria-hidden={!enabled}
        aria-selected={isSelected}
        onDoubleClick={openNodeEditor}
        ref={draggable ? provided?.innerRef : null}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
      >
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <DropdownWithoutMaxWidth
            disabled={!enabled}
            content={
              <AppearanceDropdown
                selectedColor={color}
                selectedLineStyle={lineStyle}
                selectedLineWeight={lineWeight}
                selectedInterpolation={interpolation}
                onUpdate={onUpdateAppearance}
                translations={
                  useTranslations(
                    AppearanceDropdown.translationKeys,
                    'AppearanceDropdown'
                  ).t
                }
              />
            }
          >
            <StyleButton
              disabled={!enabled}
              icon="Function"
              styleColor={color}
              label="Workflow Function"
            />
          </DropdownWithoutMaxWidth>
        </td>
        <td>
          <SourceItem disabled={!enabled} key={id}>
            <SourceStatus
              onClick={(event) => {
                event.stopPropagation();
                onStatusIconClick();
              }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <StyledVisibilityIcon type={enabled ? 'EyeShow' : 'EyeHide'} />
            </SourceStatus>
            <SourceName>
              <TranslatedEditableText
                isError={hasError}
                value={name || 'noname'}
                onChange={(value) => {
                  onUpdateName(value);
                  setIsEditingName(false);
                }}
                onCancel={() => setIsEditingName(false)}
                editing={isEditingName}
                hideButtons
              />
            </SourceName>
            {call && status === 'Running' && (
              <StyledStatusIcon type={getIconTypeFromStatus(status)} />
            )}
          </SourceItem>
        </td>
        {isWorkspaceMode && (
          <>
            <td className="bordered col-status">
              {hasError && status === 'Success' && (
                <AlertIcon
                  icon="ErrorFilled"
                  variant="danger"
                  onClick={() => onErrorIconClick(id)}
                  onDoubleClick={(event) => event.stopPropagation()}
                />
              )}
              {!hasError && hasWarning && status === 'Success' && (
                <AlertIcon
                  icon="WarningFilled"
                  variant="warning"
                  onClick={() => onErrorIconClick(id)}
                  onDoubleClick={(event) => event.stopPropagation()}
                />
              )}
            </td>
            <td className="bordered" />
            <td className="bordered">
              <SourceItem disabled={!enabled}>
                <SourceName>
                  <SourceDescription>
                    <Tooltip content={name || 'noname'} maxWidth={350}>
                      <>{name || 'noname'}</>
                    </Tooltip>
                  </SourceDescription>
                </SourceName>
              </SourceItem>
            </td>
            <td className="bordered">
              <SourceItem disabled={!isVisible}>
                {formatValueForDisplay(summary?.min)}
              </SourceItem>
            </td>
            <td className="bordered">
              <SourceItem disabled={!isVisible}>
                {formatValueForDisplay(summary?.max)}
              </SourceItem>
            </td>
            <td className="bordered">
              <SourceItem disabled={!isVisible}>
                {formatValueForDisplay(summary?.mean)}
              </SourceItem>
            </td>
            <td className="col-unit">
              <UnitDropdown
                unit={unit}
                preferredUnit={preferredUnit}
                customUnitLabel={customUnitLabel}
                onOverrideUnitClick={onOverrideUnitClick}
                onConversionUnitClick={onConversionUnitClick}
                onResetUnitClick={onResetUnitClick}
                onCustomUnitLabelClick={onCustomUnitLabelClick}
                translations={unitDropdownTranslations}
              />
            </td>
            <td className="downloadChartHide col-action" />
            <td
              style={{ textAlign: 'center', paddingLeft: 0 }}
              className="downloadChartHide col-action"
            >
              <Popconfirm
                onConfirm={onRemoveSourceClick}
                okText={t.Remove}
                cancelText={t.Cancel}
                content={
                  <div style={{ textAlign: 'left' }}>
                    {t['Remove this calculation?']}
                  </div>
                }
              >
                <Button
                  type="ghost"
                  icon="Delete"
                  style={{ height: 28 }}
                  aria-label="delete"
                />
              </Popconfirm>
            </td>
            <td
              style={{ textAlign: 'center', paddingLeft: 0 }}
              className="downloadChartHide col-action"
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
              className="downloadChartHide col-action"
            >
              <Dropdown.Uncontrolled
                options={[
                  {
                    label: t['Edit calculation'],
                    icon: 'Function',
                    onClick: openNodeEditor,
                  },
                  {
                    label: t.Duplicate,
                    icon: 'Duplicate',
                    /**
                     * TODO: Move this logic out and pass back in as prop
                     */
                    onClick: () => {
                      onDuplicateCalculation();
                      trackUsage('ChartView.DuplicateCalculation');
                    },
                  },
                  {
                    label: t['Save & Schedule'],
                    icon: 'Clock',
                    onClick: () => {
                      setSCModalVisible(true);
                    },
                  },
                ]}
              />
            </td>
          </>
        )}
      </SourceRow>
      {sCModalVisible ? (
        <ScheduledCalculationModal
          workflowId={workflow.id}
          onClose={() => setSCModalVisible(false)}
        />
      ) : null}
    </>
  );
}

WorkflowRow.translationKeys = translationKeys(defaultTranslations);
WorkflowRow.defaultTranslations = defaultTranslations;
WorkflowRow.translationNamespace = 'WorkflowRow';

export default WorkflowRow;
