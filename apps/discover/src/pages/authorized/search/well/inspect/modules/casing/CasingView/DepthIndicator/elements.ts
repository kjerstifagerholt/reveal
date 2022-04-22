import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

import { Center } from 'styles/layout';

import {
  DEPTH_INDICATOR_END_HEIGHT,
  DEPTH_INDICATOR_LINE_WIDTH,
  SEGMENT_COLOR,
  TOOLTIP_HOVER_AREA,
} from './constants';

export const DepthIndicatorWrapper = styled.div`
  display: inline-block;
  width: ${DEPTH_INDICATOR_LINE_WIDTH};
  height: 100%;
  cursor: pointer;
  transform: ${(props: { transform?: string }) => props.transform};
  margin-right: 20px;
`;

export const DepthIndicatorLineWrapper = styled(Center)`
  width: calc(${TOOLTIP_HOVER_AREA} + ${TOOLTIP_HOVER_AREA});
  ${(props: { height?: string }) => `
    height: ${props.height};
  `}
`;

export const DepthIndicatorLine = styled.div`
  width: ${DEPTH_INDICATOR_LINE_WIDTH};
  box-sizing: border-box;
  float: left;
  ${(props: { color: string; height?: string }) => `
    background: ${props.color};
    height: 100%;
  `}
`;

export const Description = styled.div`
  position: relative;
  bottom: -2px;
  padding: 2px;
  text-transform: lowercase;
  /** left: ${(props: { linerCasing: boolean }) =>
    props.linerCasing ? '9px' : '25px'}; **/
  float: left;

  height: 18px;
  background: #efeef0;
  border-radius: 4px;

  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  display: flex;
  align-items: center;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
`;

export const TriangleBottomRight = styled.div`
  width: 0;
  height: 0;
  border-bottom: ${DEPTH_INDICATOR_END_HEIGHT} solid ${SEGMENT_COLOR};
  border-right: ${DEPTH_INDICATOR_END_HEIGHT} solid transparent;
  border-left: ${DEPTH_INDICATOR_LINE_WIDTH} solid ${SEGMENT_COLOR};
  margin-left: ${DEPTH_INDICATOR_END_HEIGHT};
  float: left;
`;

export const TriangleBottomLeft = styled(TriangleBottomRight)`
  transform: rotateY(180deg);
  margin-left: -${DEPTH_INDICATOR_END_HEIGHT};
`;

export const TooptipSection = styled(Menu.Item)`
  flex-direction: column;
  align-items: flex-start;
`;
