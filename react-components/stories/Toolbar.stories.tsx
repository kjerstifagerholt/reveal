/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  RevealContainer,
  RevealToolbar,
  withSuppressRevealEvents
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
import styled from 'styled-components';
import { Button, Menu, ToolBar, type ToolBarButton } from '@cognite/cogs.js';
import { type ReactElement, useState } from 'react';

const meta = {
  title: 'Example/Toolbar',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))`
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

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    }
  },
  render: ({ addModelOptions }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CadModelContainer addModelOptions={addModelOptions} />
      <RevealToolbar customSettingsContent={exampleCustomSettingElements()} />
      <MyCustomToolbar>
        <RevealToolbar.FitModelsButton />
        <ToolBar.ButtonGroup buttonGroup={exampleToolBarButtons} />
        <RevealToolbar.SlicerButton />
      </MyCustomToolbar>
    </RevealContainer>
  )
};
