import navigation from 'constants/navigation';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { TAB_NAMES, WellInspectTabs } from './constants';
import ThreeDee from './modules/3d';
import Casing from './modules/casings';
import DigitalRocks from './modules/digitalRocks';
import EventsNds from './modules/events/Nds';
import EventsNpt from './modules/events/Npt';
import Measurements from './modules/measurements';
import NdsEvents from './modules/ndsEvents';
import Overview from './modules/overview';
import RelatedDocument from './modules/relatedDocument';
import Trajectory from './modules/trajectory';
import WellLogs from './modules/wellLogs';
import { Tab } from './types';

export const useTabs = () => {
  const { data: wellsConfig } = useWellConfig();
  const { location } = window;

  const TAB_ITEMS: Tab[] = [
    {
      key: 'overview',
      name: TAB_NAMES.OVERVIEW,
      path: navigation.SEARCH_WELLS_INSPECT_OVERVIEW,
      componentToRender: Overview,
      enabled: !!wellsConfig?.overview?.enabled,
    },
    {
      key: 'trajectory',
      name: TAB_NAMES.TRAJECTORIES,
      path: navigation.SEARCH_WELLS_INSPECT_TRAJECTORY,
      componentToRender: Trajectory,
      enabled: !!wellsConfig?.trajectory?.enabled,
    },
    {
      key: 'nds',
      name: TAB_NAMES.NDS_EVENTS,
      path: navigation.SEARCH_WELLS_INSPECT_EVENTSNDS,
      componentToRender: EventsNds,
      enabled: !!wellsConfig?.nds?.enabled,
    },
    {
      key: 'ndsV2',
      name: `${TAB_NAMES.NDS_EVENTS} V2` as WellInspectTabs,
      path: `${navigation.SEARCH_WELLS_INSPECT_EVENTSNDS}_2`,
      componentToRender: NdsEvents,
      enabled:
        location.host === 'localhost:3000' ||
        location.host.includes('-discover.pr.'),
    },
    {
      key: 'npt',
      name: TAB_NAMES.NPT_EVENTS,
      path: navigation.SEARCH_WELLS_INSPECT_EVENTSNPT,
      componentToRender: EventsNpt,
      enabled: !!wellsConfig?.npt?.enabled,
    },
    {
      key: 'casing',
      name: TAB_NAMES.CASINGS,
      path: navigation.SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS,
      componentToRender: Casing,
      enabled: !!wellsConfig?.casing?.enabled,
    },
    {
      key: 'logs',
      name: TAB_NAMES.WELL_LOGS,
      path: navigation.SEARCH_WELLS_INSPECT_LOGTYPE,
      componentToRender: WellLogs,
      enabled: !!wellsConfig?.logs?.enabled,
    },
    {
      key: 'relatedDocument',
      name: TAB_NAMES.RELATED_DOCUMENTS,
      path: navigation.SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS,
      componentToRender: RelatedDocument,
      enabled: !!wellsConfig?.relatedDocument?.enabled,
    },
    {
      key: 'digitalRocks',
      name: TAB_NAMES.DIGITAL_ROCKS,
      path: navigation.SEARCH_WELLS_INSPECT_DIGITALROCKS,
      componentToRender: DigitalRocks,
      enabled: !!wellsConfig?.digitalRocks?.enabled,
    },
    {
      key: 'measurements',
      name: TAB_NAMES.GEOMECHANICS_PPFG,
      path: navigation.SEARCH_WELLS_INSPECT_MEASUREMENTS,
      componentToRender: Measurements,
      enabled: !!wellsConfig?.measurements?.enabled,
    },
    {
      key: 'threeDee',
      name: TAB_NAMES.THREE_DEE,
      path: navigation.SEARCH_WELLS_INSPECT_THREEDEE,
      componentToRender: ThreeDee,
      standalone: true,
      enabled: !!wellsConfig?.threeDee?.enabled,
    },
  ];

  return TAB_ITEMS.filter((tab) => tab.enabled);
};
