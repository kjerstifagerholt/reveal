import React, { useState } from 'react';

import layers from 'utils/zindex';

import { Tooltip } from 'components/popper-tooltip';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';
import { PreviewCasingType } from 'modules/wellSearch/types';

import { TOOLTIP_PLACEMENT } from './constants';
import { DepthSegment } from './DepthSegment';
import { DepthIndicatorWrapper, Description } from './elements';
import { TooltipContent } from './TooltipContent';

export interface DepthIndicatorProps {
  normalizedCasing: PreviewCasingType;
  flip?: boolean;
}

const triangleHeight = 16;

/**
 * This component is used to generate depth indicator for a casing
 */
const DepthIndicator: React.FC<DepthIndicatorProps> = ({
  normalizedCasing,
  flip = false,
}) => {
  const enableWellSdkV3 = useEnabledWellSdkV3();

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);

  const {
    casingStartDepth = 0,
    casingDepth,
    casingDescription,
    outerDiameter,
    linerCasing = false,
    leftEnd,
  } = normalizedCasing;

  const startHeight = `${casingStartDepth}%`;
  const middleHeight = `calc(${casingDepth}% - ${triangleHeight}px)`;
  const indicatorTransform = flip ? `rotateY(180deg)` : undefined;

  const tooltipContent = enableWellSdkV3 ? (
    <TooltipContent {...normalizedCasing} />
  ) : (
    casingDescription
  );

  return (
    <DepthIndicatorWrapper
      transform={indicatorTransform}
      data-testid="depth-indicator"
      style={{ zIndex }}
      /**
       * A trick to prevent tooltip being overlapped.
       * This increases the zIndex of hovered depth indicator by one.
       * Then return it to the initial when the mouse left.
       */
      onMouseEnter={() => setZIndex((zIndex) => zIndex + 1)}
      onMouseLeave={() => setZIndex((zIndex) => zIndex - 1)}
    >
      <Tooltip
        followCursor
        content={tooltipContent}
        placement={TOOLTIP_PLACEMENT}
      >
        <DepthSegment.Start height={startHeight} />
        <DepthSegment.Middle height={middleHeight} />
        <DepthSegment.End linerCasing={linerCasing} leftEnd={leftEnd} />
      </Tooltip>

      {outerDiameter && (
        <Description linerCasing={linerCasing}>{outerDiameter}</Description>
      )}
    </DepthIndicatorWrapper>
  );
};

export default DepthIndicator;
