/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  type QualitySettings,
  RevealToolbar,
  withSuppressRevealEvents,
  withCameraStateUrlParam,
  useGetCameraStateFromUrlParam,
  useCameraNavigation
} from '../src';
import { Color } from 'three';
import styled from 'styled-components';
import { Button, Menu, ToolBar, type ToolBarButton } from '@cognite/cogs.js';
import { type ReactElement, useState, useEffect } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';

const meta = {
  title: 'Example/Toolbar',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MyCustomToolbar = styled(withSuppressRevealEvents(withCameraStateUrlParam(ToolBar)))`
  position: absolute;
  right: 20px;
  top: 70px;
`;

const exampleToolBarButtons: ToolBarButton[] = [
  {
    icon: 'Edit'
  },
  {
    icon: 'World'
  }
];

const exampleCustomSettingElements = (): ReactElement => {
  const [originalCadColor, setOriginalCadColor] = useState(false);

  return (
    <>
      <Menu.Item
        hasSwitch
        toggled={originalCadColor}
        onChange={() => {
          setOriginalCadColor((prevMode) => !prevMode);
        }}>
        Original CAD coloring
      </Menu.Item>
      <Button>Custom Button</Button>
    </>
  );
};

const exampleHighQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 95000000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 12000000
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
    movingCameraResolutionFactor: 1
  }
};

const exampleLowQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 10_000_000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 2_000_000
  },
  resolutionOptions: {
    maxRenderResolution: 1e5,
    movingCameraResolutionFactor: 1
  }
};

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }) => (
    <RevealStoryContainer color={new Color(0x4a4a4a)}>
      <FitToUrlCameraState />
      <CadModelContainer addModelOptions={addModelOptions} />
      <RevealToolbar
        customSettingsContent={exampleCustomSettingElements()}
        lowFidelitySettings={exampleLowQualitySettings}
        highFidelitySettings={exampleHighQualitySettings}
      />
      <MyCustomToolbar>
        <RevealToolbar.FitModelsButton />
        <ToolBar.ButtonGroup buttonGroup={exampleToolBarButtons} />
        <RevealToolbar.SlicerButton />
      </MyCustomToolbar>
    </RevealStoryContainer>
  )
};

function FitToUrlCameraState(): ReactElement {
  const getCameraState = useGetCameraStateFromUrlParam();
  const cameraNavigation = useCameraNavigation();

  useEffect(() => {
    signalStoryReadyForScreenshot();
    const currentCameraState = getCameraState();
    if (currentCameraState === undefined) return;
    cameraNavigation.fitCameraToState(currentCameraState);
  }, []);

  return <></>;
}
