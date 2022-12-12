const EXPLORATION_PREFIX = 'Exploration';

const COPY = {
  O_DATA: `${EXPLORATION_PREFIX}.CopyODataQuery`,
  URL_TO_CLIPBOARD: `${EXPLORATION_PREFIX}.Copy.UrlToClipboard`,
};

const CLICK = {
  POWER_BI_CONNECTOR: `${EXPLORATION_PREFIX}.Click.PowerBiConnector`,
  GRAFANA_CONNECTOR: `${EXPLORATION_PREFIX}.Click.GrafanaConnector`,
  COLLAPSE_FULL_PAGE: `${EXPLORATION_PREFIX}.Click.CollapseFullPage`,
  EXPAND_FULL_PAGE: `${EXPLORATION_PREFIX}.Click.ExpandFullPage`,
  CLOSE_DETAILED_VIEW: `${EXPLORATION_PREFIX}.Click.CloseDetailedView`,
  CLOSE_FULL_PAGE: `${EXPLORATION_PREFIX}.Click.CloseFullPage`,
  EMPHASIZE_CLICKABLE_OBJECT: `${EXPLORATION_PREFIX}.Click.EmphasizeClickableObject`,
  SLICE: `${EXPLORATION_PREFIX}.Click.Slice`,
  MEASURING_TOOL: `${EXPLORATION_PREFIX}.Click.MeasuringTool`,
  HELP: `${EXPLORATION_PREFIX}.Click.Help`,
  APPLY_MODEL: `${EXPLORATION_PREFIX}.Click.ApplyModel`,
  RESET_FILTER: `${EXPLORATION_PREFIX}.Click.ResetFilters`,
  ALL_RESULTS: `${EXPLORATION_PREFIX}.Click.AllResults`,
  TOGGLE_ASSET_TABLE_VIEW: `${EXPLORATION_PREFIX}.Click.ToggleAssetTableView`,
  TOGGLE_FILTERS_VIEW: `${EXPLORATION_PREFIX}.Click.ToggleFilterView`,
};

const SELECT = {
  FILTER_BY: `${EXPLORATION_PREFIX}.Select.FilterBy`,
  RELATIONSHIP_LABEL: `${EXPLORATION_PREFIX}.Select.RelationshipLabels`,
};

const SEARCH = {
  GLOBAL: `${EXPLORATION_PREFIX}.Search.Global`,
};

const LOAD = {
  APPLICATION: `${EXPLORATION_PREFIX}.Load.Application`,
};

export const EXPLORATION = {
  COPY,
  CLICK,
  SELECT,
  SEARCH,
  LOAD,
};
