import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { ThemeProvider } from 'styled-components/macro';

import {
  NodeVisualizerProvider,
  SubSurfaceModule,
  Modules,
  ThreeModule,
  BaseRootNode,
} from '@cognite/node-visualizer';

import { useDeepEffect } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { getSeismicSDKClient } from 'modules/seismicSearch/service';
import { ThreeDeeTheme } from 'styles/ThreeDeeTheme';

import { Toolbar } from './Toolbar';
import { ThreeDeeProps } from './types';
import { normalizeWellsData } from './utils/normalizeWellsData';

const ThreeDee: React.FC<ThreeDeeProps> = ({
  wells,
  trajectories,
  ndsEvents,
  nptEvents,
  casings,
  wellLogs,
  fileId,
}) => {
  const [root, setRoot] = React.useState<BaseRootNode>();
  const { data } = useUserPreferencesMeasurement();

  useDeepEffect(() => {
    Modules.instance.clearModules();

    const modules = Modules.instance;
    modules.add(new ThreeModule());

    const subsurfaceModule = new SubSurfaceModule();

    if (fileId) {
      subsurfaceModule.addSeismicCube(getSeismicSDKClient(), fileId);
    }

    if (wells && !isEmpty(wells)) {
      subsurfaceModule.addWellData(
        normalizeWellsData({
          wells,
          trajectories,
          casings,
          wellLogs,
          ndsEvents,
          nptEvents,
        })
      );
    }

    modules.add(subsurfaceModule);
    modules.install();
    setRoot(modules.createRoot());
  }, [fileId, wells, wellLogs]);

  const rootElement = React.useMemo(() => {
    return (
      root && (
        <NodeVisualizerProvider root={root} toolbar={Toolbar} unit={data} />
      )
    );
  }, [root]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={ThreeDeeTheme}>{rootElement}</ThemeProvider>
    </React.StrictMode>
  );
};

export default ThreeDee;
