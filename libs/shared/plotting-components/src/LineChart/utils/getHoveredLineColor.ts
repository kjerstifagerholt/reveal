import head from 'lodash/head';
import { PlotMouseEvent } from 'plotly.js';

import { DEFAULT_LINE_COLOR } from '../constants';

export const getHoveredLineColor = (plotMouseEvent?: PlotMouseEvent) => {
  const color = head(plotMouseEvent?.points)?.data.line.color;
  return String(color || DEFAULT_LINE_COLOR);
};
