import { Color } from 'three';

import { DefaultNodeAppearance } from '@cognite/reveal';
import { QualitySettings } from '@cognite/reveal-react-components';

export const CONTEXTUALIZE_EDITOR_HEADER_HEIGHT = 40;
export const FLOATING_ELEMENT_MARGIN = 15;
export const DEFAULT_RIGHT_SIDE_PANEL_WIDTH = 500;

export const defaultRevealColor = new Color(0x000000);

export const DEFAULT_POINT_BUDGET = 3_000_000;
export const DEFAULT_CAD_BUDGET = 10_000_000;

export const DEFAULT_POINT_SIZE = 2;
export const MIN_POINT_SIZE = 0.0;
export const MAX_POINT_SIZE = 4; // Default seems be be 2, but the user probably wants lower values
export const STEP_POINT_SIZE = 0.1;

export const ANNOTATION_SUGGESTED_COLOR = 0xffff00; // yellow
export const ANNOTATION_APPROVED_COLOR = 0x00ff00; // green
export const ANNOTATION_REJECTED_COLOR = 0xff0000; // red
export const ANNOTATION_CYLINDER_RADIUS_MARGIN = 0.2; // 20 % percent extra margin on the cylinder radius

export const LowQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: 1.4e6,
    movingCameraResolutionFactor: 1,
  },
};

export const HighQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 2 * DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: 3 * DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
  },
};

// TODO: Refactor in a better way
export const cadNodeStyles = [
  DefaultNodeAppearance.Default,
  new Color(0.6, 0.2, 0.78), // contextualized
  new Color(0.38, 0.27, 0.72), // selected and contextualized
];
