//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { PolylinesNode } from "../Nodes/PolylinesNode";
import { PolylinesThreeView } from "./PolylinesThreeView";
import { BaseModule } from "../Core/Module/BaseModule";
import { ViewFactory } from "../Core/Views/ViewFactory";
import { ThreeTargetNode } from "./ThreeTargetNode";
import { BaseRootNode } from "../Core/Nodes/BaseRootNode";
import { ThreeRootNode } from "./ThreeRootNode";
import { RenderTargetNode } from "../Core/Nodes/RenderTargetNode";
import { PotreeNode } from "../Nodes/PotreeNode";
import { PotreeThreeView } from "./PotreeThreeView";
import { SurfaceNode } from '../Nodes/SurfaceNode';
import { SurfaceThreeView } from './SurfaceThreeView';

export class ThreeModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  protected /*override*/ installPackages(): void
  {
    CameraControls.install({ THREE });
  }

  protected /*override*/ registerViewsCore(factory: ViewFactory): void
  {
    factory.register(PotreeNode.name, PotreeThreeView, ThreeTargetNode.name);
    factory.register(SurfaceNode.name, SurfaceThreeView, ThreeTargetNode.name);
    factory.register(PolylinesNode.name, PolylinesThreeView, ThreeTargetNode.name);
  }

  protected /*override*/ createRootCore(): BaseRootNode
  {
    return new ThreeRootNode();
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    document.body.onresize = () =>
    {
      for (const target of root.targetFolder.getChildrenByType(RenderTargetNode))
        target.onResize()
    }
  }
}

