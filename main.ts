import * as THREE from 'three';

import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Nodes/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import { PotreeNode } from './src/Nodes/PotreeNode';
import { SurfaceNode } from './src/Nodes/SurfaceNode';
import { RegularGrid2 } from './src/Core/Geometry/RegularGrid2';
import { ThreeTargetNode } from './src/Three/ThreeTargetNode';
import { Range3 } from './src/Core/Geometry/Range3';
import { WellNode } from './src/Nodes/WellNode';
import { Well } from './src/Nodes/Well';
import { PointsNode } from './src/Nodes/PointsNode';
import { Points } from './src/Core/Geometry/Points';
import { BaseNode } from './src/Core/Nodes/BaseNode';
import { ColorType } from './src/Core/Enums/ColorType';
import { Colors } from './src/Core/PrimitivClasses/Colors';

main();

export function main()
{
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();


  // Add data
  for (let i = 0; i < 1; i++)
  {
    const node = new PointsNode();
    node.data = Points.createByRandom(1000, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  for (let i = 0; i < 1; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(20, 10, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  {
    const node = new SurfaceNode();
    node.data = RegularGrid2.createFractal(Range3.newTest, 8, 2);
    root.dataFolder.addChild(node);
  }
  for (let i = 0; i < 10; i++)
  {
    const node = new WellNode();
    node.data = Well.createByRandom(20, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  {
    const node = new PotreeNode();
    node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
    node.name = 'Barcelona';
    node.url = '/Real/ept.json';
    node.name = 'Aerfugl';
    root.dataFolder.addChild(node);
  }
  {
    const range = Range3.create(0, 0, 1, 0.5);
    const target = new ThreeTargetNode(range);
    root.targetFolder.addChild(target)
    target.initializeRecursive();
  }
  {
    const range = Range3.create(0, 0.5, 1, 1);
    const target = new ThreeTargetNode(range);
    root.targetFolder.addChild(target);
    target.initializeRecursive();
  }

  module.initializeWhenPopulated(root);
  for (const domElement of module.getDomElements(root))
    document.body.appendChild(domElement);


  // Set some visible
  root.targetFolder.children[0].setActiveInteractive();

  // Trick
  (window as any).camera = (root.activeTarget as ThreeTargetNode).activeCamera;

  for (const node of root.getDescendantsByType(PotreeNode))
    node.setVisible(true);

  const use1 = false;
  if (use1)
  {
    for (const node of root.getDescendantsByType(PointsNode))
    {
      const style = node.renderStyle;
      if (style)
      {
        style.colorType = ColorType.NodeColor;
        style.size = 2;
      }
      node.setVisible(true);
    }
    for (const node of root.getDescendantsByType(PolylinesNode))
    {
      const style = node.renderStyle;
      if (style)
        style.lineWidth = 10;
      node.setVisible(true);
    }
    for (const node of root.getDescendantsByType(SurfaceNode))
    {
      const style = node.renderStyle;
      node.color = Colors.grey;
      if (style)
      {
        style.colorType = ColorType.NodeColor;
      }
      node.setVisible(true);
    }
  }

  root.targetFolder.children[1].setActiveInteractive();
  for (const node of root.getDescendantsByType(PointsNode))
  {
    const style = node.renderStyle;
    if (style)
    {
      style.colorType = ColorType.DepthColor;
      style.size = 50;
    }
    node.setVisible(true);
  }
  for (const node of root.getDescendantsByType(WellNode))
    node.setVisible(true);
  for (const node of root.getDescendantsByType(SurfaceNode))
  {
    const style = node.renderStyle;
    if (style)
    {
      style.colorType = ColorType.DepthColor;
    }
    node.setVisible(true);
  }

  // {
  //   const range = root.getBoundingBoxRecursive();

  //   if (range && target && !range.isEmpty && target.activeCamera instanceof THREE.PerspectiveCamera)
  //   {
  //     const camera = target.activeCamera;
  //     camera.position.set(range.x.center, range.y.center, range.z.center + 1000);
  //     camera.updateProjectionMatrix();
  //     camera.updateMatrix();
  //   }
  // }

}



