const MODEL_DETAILS = 'ModelDetails';
const CALCUATION_LIST = 'CalculationsList';
const VERSION_DETAILS = 'VersionDetails';

export const TRACKING_EVENTS = {
  MODEL_DETAILS_VIEW: `${MODEL_DETAILS}.View`,
  MODEL_CALC_LIST: `${MODEL_DETAILS}.${CALCUATION_LIST}`,
  MODEL_CACL_CONFIG: `${MODEL_DETAILS}.${CALCUATION_LIST}.Configure`,
  MODEL_CALC_EDIT: `${MODEL_DETAILS}.${CALCUATION_LIST}.EditConfiguration`,
  NEW_MODEL_VERSION: `${MODEL_DETAILS}.NewModelVersion`,
  MODEL_VERSION_DEAILS: `${MODEL_DETAILS}.${VERSION_DETAILS}`,
  MODEL_VERSION_DOWNLOAD: `${MODEL_DETAILS}.VersionDetails.Download`,
  NEW_MODEL: 'CreateNewModel',
  MODEL_CALC_RUN_NOW: `${MODEL_DETAILS}.${CALCUATION_LIST}.RunNow`,
  MODEL_CALC_RUN_ALL: `${MODEL_DETAILS}.${CALCUATION_LIST}.RunAll`,
  MODEL_CALC_VIEW_RUN_HISTORY: `${MODEL_DETAILS}.${CALCUATION_LIST}.ViewRunHistory`,
  RUN_BROWSER_VIEW: 'RunBrowserView',
  PROFILE_AVATAR_CLICK: 'ProfileAvatarClick',
  NAVBAR_LABELS_CLICK: 'NavbarLabelsClick',
};

type TrackingEventKeys = keyof typeof TRACKING_EVENTS;
export type TrackingEventNames = (typeof TRACKING_EVENTS)[TrackingEventKeys];
