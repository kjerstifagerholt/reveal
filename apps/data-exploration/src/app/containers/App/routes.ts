export enum ViewType {
  All = 'all',
  Asset = 'asset',
  Canvas = 'canvas',
  IndustryCanvas = 'industryCanvas',
  TimeSeries = 'timeSeries',
  File = 'file',
  Event = 'event',
  Sequence = 'sequence',
  ThreeD = 'threeD',
}

// TODO: find better names for dynamic route slugs; i.e. :id, :tabType..
// and later we can have separate id for each view type.
// e.g. SELECTED_ASSET_ID = ':assetId'
const SELECTED_ID = ':id';
const SELECTED_BASE_ID = ':baseResourceId';
const SELECTED_DETAIL_TAB = ':tabType';

export const routes = {
  root: {
    path: '/',
  },
  searchRoot: {
    path: '/search/*',
  },
  assetView: {
    path: `/${ViewType.Asset}/*`,
  },
  timeseriesView: {
    path: `/${ViewType.TimeSeries}/*`,
  },
  fileView: {
    path: `/${ViewType.File}/*`,
  },
  eventView: {
    path: `/${ViewType.Event}/*`,
  },
  sequenceView: {
    path: `/${ViewType.Sequence}/*`,
  },
  threeDView: {
    path: `/${ViewType.ThreeD}/*`,
  },

  // Paths for details splitted over the right side of the screen
  viewDetail: {
    path: `/${SELECTED_ID}`,
  },
  viewDetailTab: {
    path: `/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  viewAssetDetail: {
    path: `/${SELECTED_BASE_ID}/${ViewType.Asset}/${SELECTED_ID}`,
  },
  viewAssetDetailTab: {
    path: `/${SELECTED_BASE_ID}/${ViewType.Asset}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },

  // Paths for full page details below;
  assetPage: {
    path: `/${ViewType.Asset}/${SELECTED_ID}`,
  },
  assetPageTab: {
    path: `/${ViewType.Asset}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  timeseriesPage: {
    path: `/${ViewType.TimeSeries}/${SELECTED_ID}`,
  },
  timeseriesPageTab: {
    path: `/${ViewType.TimeSeries}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  filePage: {
    path: `/${ViewType.File}/${SELECTED_ID}`,
  },
  canvas: {
    path: `/${ViewType.Canvas}`,
  },
  industryCanvas: {
    path: `/${ViewType.IndustryCanvas}`,
  },
  filePageTab: {
    path: `/${ViewType.File}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  eventPage: {
    path: `/${ViewType.Event}/${SELECTED_ID}`,
  },
  eventPageTab: {
    path: `/${ViewType.Event}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  sequencePage: {
    path: `/${ViewType.Sequence}/${SELECTED_ID}`,
  },
  sequencePageTab: {
    path: `/${ViewType.Sequence}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
  threeDPage: {
    path: `/${ViewType.ThreeD}/${SELECTED_ID}`,
  },
  threeDPageTab: {
    path: `/${ViewType.ThreeD}/${SELECTED_ID}/${SELECTED_DETAIL_TAB}`,
  },
};
