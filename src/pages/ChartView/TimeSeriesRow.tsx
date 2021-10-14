import { useState } from 'react';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import { Button, Dropdown, Tooltip, Popconfirm } from '@cognite/cogs.js';
import { removeTimeseries, updateTimeseries } from 'utils/charts';
import { useLinkedAsset } from 'hooks/api';
import EditableText from 'components/EditableText';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import { UnitDropdown } from 'components/UnitDropdown';
import { trackUsage } from 'utils/metrics';
import { roundToSignificantDigits } from 'utils/axis';
import { convertValue } from 'utils/units';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { timeseriesSummaryById } from 'atoms/timeseries';
import flow from 'lodash/flow';
import {
  SourceItem,
  SourceCircle,
  SourceName,
  SourceRow,
  SourceDescription,
  SourceTag,
} from './elements';

type Props = {
  mutate: (update: (c: Chart | undefined) => Chart) => void;
  chart: Chart;
  timeseries: ChartTimeSeries;
  disabled?: boolean;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  isWorkspaceMode?: boolean;
  isFileViewerMode?: boolean;
  dateFrom: string;
  provided?: DraggableProvided | undefined;
  dateTo: string;
  draggable?: boolean;
};
export default function TimeSeriesRow({
  mutate,
  timeseries,
  onRowClick = () => {},
  onInfoClick = () => {},
  disabled = false,
  isSelected = false,
  isWorkspaceMode = false,
  isFileViewerMode = false,
  draggable = false,
  provided = undefined,
}: Props) {
  const {
    id,
    description,
    name,
    unit,
    preferredUnit,
    originalUnit,
    enabled,
    color,
    tsExternalId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const update = (_tsId: string, diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => ({
      ...oldChart!,
      timeSeriesCollection: oldChart!.timeSeriesCollection?.map((t) =>
        t.id === _tsId
          ? {
              ...t,
              ...diff,
            }
          : t
      ),
    }));

  const remove = () => mutate((oldChart) => removeTimeseries(oldChart!, id));

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => updateTimeseries(oldChart!, id, diff));

  const updateUnit = async (unitOption: any) => {
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;
    const nextInputUnit = unitOption?.value;

    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];
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

  const updatePrefferedUnit = async (unitOption: any) => {
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;
    const nextOutputUnit = unitOption?.value;

    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];

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
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;

    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];
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
      unit: originalUnit,
      preferredUnit: originalUnit,
      range,
    });
  };

  const { data: linkedAsset } = useLinkedAsset(tsExternalId, true);
  const summary = useRecoilValue(timeseriesSummaryById(tsExternalId));

  return (
    <SourceRow
      key={id}
      onClick={() => !disabled && onRowClick(id)}
      className={isSelected ? 'active' : undefined}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <td>
        <SourceItem isDisabled={disabled} key={id}>
          <SourceCircle
            onClick={(event) => {
              event.stopPropagation();
              update(id, {
                enabled: !enabled,
              });
            }}
            color={color}
            fade={!enabled}
          />
          <SourceName title={name}>
            {!isFileViewerMode && (
              <EditableText
                value={name || 'noname'}
                onChange={(value) => {
                  update(id, { name: value });
                  trackUsage('ChartView.RenameTimeSeries');
                  setIsEditingName(false);
                }}
                onCancel={() => setIsEditingName(false)}
                editing={isEditingName}
                hideButtons
              />
            )}
            {isFileViewerMode && name}
          </SourceName>
        </SourceItem>
      </td>
      {(isWorkspaceMode || isFileViewerMode) && (
        <>
          <td>
            <SourceItem>
              <SourceDescription>
                <Tooltip content={description}>
                  <>{description}</>
                </Tooltip>
              </SourceDescription>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceTag>{linkedAsset?.name}</SourceTag>
            </SourceItem>
          </td>
        </>
      )}
      {isWorkspaceMode && (
        <>
          <td>
            {typeof summary?.min === 'number'
              ? roundToSignificantDigits(
                  convertValue(summary?.min, unit, preferredUnit),
                  3
                )
              : '-'}
          </td>
          <td>
            {typeof summary?.max === 'number'
              ? roundToSignificantDigits(
                  convertValue(summary?.max, unit, preferredUnit),
                  3
                )
              : '-'}
          </td>
          <td>
            {typeof summary?.mean === 'number'
              ? roundToSignificantDigits(
                  convertValue(summary?.mean, unit, preferredUnit),
                  3
                )
              : '-'}
          </td>
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <UnitDropdown
              unit={unit}
              originalUnit={originalUnit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
            />
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <PnidButton
            timeseriesExternalId={tsExternalId}
            showTooltip={false}
            hideWhenEmpty={false}
          />
        </td>
      )}
      {isWorkspaceMode && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <Dropdown content={<AppearanceDropdown update={updateAppearance} />}>
            <Button
              type="ghost"
              icon="ResourceTimeseries"
              style={{ height: 28 }}
              aria-label="timeseries"
            />
          </Dropdown>
        </td>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <Popconfirm
            onConfirm={remove}
            okText="Remove"
            content={
              <div style={{ textAlign: 'left' }}>Remove this time series?</div>
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
      )}
      {isWorkspaceMode && (
        <>
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
            {!isFileViewerMode && (
              // <Dropdown content={<TimeSeriesMenu chartId={chart.id} id={id} />}>
              <Button
                type="ghost"
                icon="MoreOverflowEllipsisHorizontal"
                style={{ height: 28 }}
                disabled
                aria-label="more"
              />
              // </Dropdown>
            )}
          </td>
        </>
      )}
    </SourceRow>
  );
}
