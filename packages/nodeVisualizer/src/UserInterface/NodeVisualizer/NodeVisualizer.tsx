// import 'UserInterface/styles/scss/react-split-pane.scss';

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';
import { RightPanel } from 'UserInterface/NodeVisualizer/Panels/RightPanel';
import { LeftPanel } from 'UserInterface/NodeVisualizer/Panels/LeftPanel';
import { NotificationsToActionsAdaptor } from 'UserInterface/Adapters/NotificationToAction';
import { VirtualUserInterface } from 'Core/States/VirtualUserInterface';
import { UserInterfaceListener } from 'UserInterface/Adapters/UserInterfaceListener';
import { Modules } from 'Core/Module/Modules';
import { BaseRootNode } from 'Core/Nodes/BaseRootNode';
import { Viewer } from 'UserInterface/Components/Viewers/Viewer';
import { Toolbar } from 'UserInterface/NodeVisualizer/ToolBar/Toolbar';
import { Appearance } from 'Core/States/Appearance';
import { State } from 'UserInterface/Redux/State/State';
import { generateNodeTree } from 'UserInterface/Redux/reducers/ExplorerReducer';
import { initializeToolbarStatus } from 'UserInterface/Redux/reducers/VisualizersReducer';
import { ViewerUtils } from 'UserInterface/NodeVisualizer/Viewers/ViewerUtils';
import { ExplorerPropType } from 'UserInterface/Components/Explorer/ExplorerTypes';
import { Explorer } from 'UserInterface/Components/Explorer/Explorer';
import {
  VisualizerToolbar,
  VisualizerToolbarProps,
} from 'UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';
import styled from 'styled-components';

export interface NodeVisualizerProps {
  /**
   * root node
   */
  root?: BaseRootNode;
  /**
   * explorer render prop - uses for customisation of node tree explorer
   */
  explorer?: React.ComponentType<ExplorerPropType>;
  /**
   * toolbar render prop - uses for customisation of visualizer toolbar
   */
  toolbar?: React.ComponentType<VisualizerToolbarProps>;
}

/**
 * Node Visualizer Component of the application
 * This will render all the Components (Settings/Explorer/3D viewers etc.)
 */
export const NodeVisualizer: React.FC<NodeVisualizerProps> = (props) => {
  const dispatch = useDispatch();
  const common = useSelector((state: State) => state.common); // -TODO: Remove state reference
  const { root, explorer, toolbar } = props;

  if (root) {
    BaseRootNode.active = root;
  }

  // success callback for registering viewers to DOM
  const viewerElementCallback = useCallback(
    (element: HTMLElement) => {
      if (!element || !root) return;

      // clear Node
      // eslint-disable-next-line no-param-reassign
      element.innerHTML = '';

      // Add new viewers here Eg - new Viewer("2D", htmlElement2D)
      ViewerUtils.addViewer('3D', new Viewer('3D', element));
      // Add targets and toolbars to root node
      const viewers = Object.values(ViewerUtils.getViewers());

      viewers.forEach((viewer) => {
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const targetNode = Modules.instance.createRenderTargetNode();
        if (!targetNode) return;

        const toolbarTools = new Toolbar();

        targetNode.addTools(toolbarTools);
        targetNode.setName(viewer.getName());
        viewer.setTarget(targetNode);
        viewer.setToolbarCommands(toolbarTools);
        root.targets.addChild(targetNode);
        element.appendChild(targetNode.domElement);
        targetNode.setActiveInteractive();
      });

      Modules.instance.initializeWhenPopulated(root);

      const notificationAdaptor = new NotificationsToActionsAdaptor(dispatch);

      VirtualUserInterface.install(
        new UserInterfaceListener(notificationAdaptor, dispatch)
      );

      // Add target and toolbar data to state
      dispatch(initializeToolbarStatus());
      dispatch(generateNodeTree());
    },
    [root]
  );

  const renderExplorer = useMemo(
    () =>
      explorer ||
      ((explorerProps: ExplorerPropType) => <Explorer {...explorerProps} />),
    [explorer]
  );

  const renderToolbar = useMemo(
    () =>
      toolbar ||
      ((toolbarProps: VisualizerToolbarProps) => (
        <VisualizerToolbar {...toolbarProps} />
      )),
    [toolbar]
  );

  return (
    <NodeVisualizerContainer>
      <SplitPane
        split="vertical"
        minSize={common.isFullscreen ? 0 : Appearance.leftPanelDefaultSize}
        maxSize={common.isFullscreen ? 0 : Appearance.leftPanelMaxSize}
        onChange={() => {
          // -TODO: Test this feature on BP
          const viewers = Object.values(ViewerUtils.getViewers());

          viewers.forEach((viewer) => {
            viewer.getTarget()?.onResize();
          });
        }}
      >
        <LeftPanel explorer={renderExplorer} custom={!!explorer} />
        <RightPanel viewer3D={viewerElementCallback} toolbar={renderToolbar} />
      </SplitPane>
    </NodeVisualizerContainer>
  );
};

const NodeVisualizerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;

  div {
    outline: none;
  }
`;
