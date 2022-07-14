import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { graphLegendConfig, GraphTrack } from '@cognite/videx-wellog';
import { PlotConfig } from '@cognite/videx-wellog/dist/tracks/graph/interfaces';

import { NO_LOGS_LEGEND_MESSAGE } from 'pages/authorized/search/well/inspect/constants';

import { GraphTrackEnum } from '../../../constants';
import { WellLogPreviewData } from '../types';

import {
  disableGraphTrack,
  getTrackConfig,
  setupElementsAppenderOnTrack,
} from './utils';

export const getGraphTrack = (
  trackLogData: WellLogPreviewData,
  trackName: GraphTrackEnum
) => {
  const plots = Object.keys(trackLogData).map<PlotConfig>(
    (columnExternalId) => {
      const { measurementType, domain, color } = trackLogData[columnExternalId];
      const trackConfig = getTrackConfig(measurementType);

      return {
        id: columnExternalId,
        type: 'line',
        options: {
          scale: trackConfig?.scale || 'linear',
          width: trackConfig?.width,
          color,
          dash: trackConfig?.dash,
          filterToScale: false,
          domain,
          dataAccessor: (data: WellLogPreviewData) =>
            get(data, `${columnExternalId}.values`, []),
          legendInfo: (data: WellLogPreviewData) => ({
            label: `${columnExternalId} (${get(
              data,
              `${columnExternalId}.unit`,
              NO_LOGS_LEGEND_MESSAGE
            )})`,
          }),
        },
      };
    }
  );

  const graphTrack = new GraphTrack(trackName, {
    label: trackName,
    abbr: trackName,
    data: trackLogData,
    legendConfig: graphLegendConfig,
    plots,
  });

  if (isEmpty(plots)) {
    setupElementsAppenderOnTrack(graphTrack, disableGraphTrack);
  }

  return graphTrack;
};
