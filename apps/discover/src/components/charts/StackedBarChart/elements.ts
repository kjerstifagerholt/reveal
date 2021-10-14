import styled from 'styled-components/macro';

import { Body, Tooltip, Menu } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { Center, FlexColumn, sizes } from 'styles/layout';

import {
  BAR_HEIGHT,
  CHART_BACKGROUND_COLOR,
  LEGEND_BOTTOM_SPACING,
} from './constants';

export const StackedBarChartWrapper = styled.div`
  background: ${CHART_BACKGROUND_COLOR};
  border-radius: ${sizes.small};
  padding: ${sizes.normal};
  height: calc(100vh - 208px);
`;

export const ChartStickyElement = styled.g`
  position: sticky;
  top: 0px;
  background: ${CHART_BACKGROUND_COLOR};
  z-index: ${layers.TABLE_HEADER};
`;

export const ChartDetailsContainer = styled(FlexColumn)`
  position: relative;
  text-align: center;
`;

export const ChartActionButtonsContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  .cogs-btn {
    color: var(--cogs-greyscale-grey6);
    margin-right: ${sizes.small};
    :last-child {
      margin-right: 0px;
    }
  }
  .cogs-btn-disabled {
    background: transparent !important;
    color: var(--cogs-greyscale-grey5) !important;
  }
  .cogs-btn-disabled:hover {
    background: transparent;
    color: var(--cogs-greyscale-grey5);
  }
`;

export const ChartTitle = styled.span`
  color: var(--cogs-text-primary);
  font-size: ${sizes.normal};
  font-weight: 600;
  margin-bottom: ${sizes.extraSmall};
`;

export const ChartSubtitle = styled.span`
  color: var(--cogs-text-hint);
  font-size: 10px;
`;

export const AxisLabel = styled(Body)`
  color: var(--cogs-text-hint) !important;
  font-size: 12px !important;
  font-weight: 500;
  margin: ${sizes.small};
`;

export const ChartContainer = styled.div`
  overflow: scroll;
  padding-bottom: ${(props: { paddingBottom: number }) =>
    `${props.paddingBottom}px`};
  max-height: calc(100vh - 322px);
  .domain {
    display: none;
  }
  .tick {
    line {
      color: var(--cogs-border-default);
    }
    text {
      color: var(--cogs-text-hint);
      font-size: 12px;
    }
  }
  .Axis-Left {
    display: none;
  }

  /* Scrollbar styles */

  ::-webkit-scrollbar {
    width: ${sizes.small};
    height: ${sizes.small};
  }
  ::-webkit-scrollbar-track {
    background: var(--cogs-greyscale-grey2);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--cogs-greyscale-grey3);
    border-radius: ${sizes.small};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--cogs-greyscale-grey4);
  }
`;

export const ChartSVG = styled.svg``;

export const BarComponent = styled.foreignObject`
  padding-top: ${sizes.medium};
`;

export const BarLabel = styled(Body)`
  display: flex;
  align-items: center;
  color: var(--cogs-text-secondary) !important;
  padding: ${sizes.extraSmall} ${sizes.small};
  margin-bottom: ${sizes.extraSmall};
  cursor: pointer;
  width: fit-content;
  i {
    margin-left: ${sizes.small};
  }
`;

export const Bar = styled(Center)`
  position: absolute;
  align-items: center;
  height: ${BAR_HEIGHT}px;
  border-radius: ${sizes.extraSmall} 0px 0px ${sizes.extraSmall};
  border-width: 2px 0px;
  border-style: solid;
  border-color: ${CHART_BACKGROUND_COLOR};
  cursor: pointer;
  ${(props: { fill: string; width: number; rounded: boolean }) => `
    background: ${props.fill};
    width: ${props.width}px;

    ${props.rounded && `border-radius: ${sizes.extraSmall}`};
  `};
`;

export const BarText = styled(Body)`
  color: var(--cogs-text-secondary) !important;
  font-size: 13px !important;
  font-weight: 500;
  margin: ${sizes.extraSmall};
`;

export const BarTooltip = styled(Tooltip)`
  position: absolute;
  white-space: nowrap;
  text-align: center;
  top: ${BAR_HEIGHT}px;
  transform: translateX(-50%);
`;

export const ChartLegend = styled(Menu)`
  flex-direction: row;
  width: fit-content;
  position: fixed;
  bottom: ${LEGEND_BOTTOM_SPACING}px;
  left: ${(props: { offsetleft: number }) =>
    `calc(${props.offsetleft}px + calc(100% - ${props.offsetleft}px) / 2)`};
  transform: translateX(-50%);
  padding: ${sizes.normal} !important;
  color: var(--cogs-text-secondary);
  border-radius: ${sizes.small};

  .cogs-checkbox {
    font-size: 12px;
    font-weight: 500;
    margin-right: ${sizes.normal};
  }
  .cogs-checkbox:last-child {
    margin-right: 0px;
  }
`;

export const LegendTitle = styled.span`
  font-size: 13px;
  text-align: center;
  margin-bottom: 12px;
`;

export const ResetToDefaultContainer = styled(FlexColumn)`
  position: relative;
  margin-top: 60px;
`;

export const ResetToDefaultButtonWrapper = styled(Center)`
  margin-top: 40px;
`;
