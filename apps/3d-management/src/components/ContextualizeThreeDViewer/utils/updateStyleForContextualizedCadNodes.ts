import { Color } from 'three/src/Three';

import {
  CogniteCadModel,
  IndexSet,
  NodeAppearance,
  NodeOutlineColor,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { AssetMapping3D, ListResponse } from '@cognite/sdk/dist/src';

export const updateStyleForContextualizedCadNodes = async ({
  model,
  cadNodes,
  nodeAppearance,
  color,
  outlineColor,
}: {
  model: CogniteCadModel;
  cadNodes: ListResponse<AssetMapping3D[]>;
  nodeAppearance: NodeAppearance | null;
  color: Color | null;
  outlineColor: NodeOutlineColor;
}) => {
  // TODO: introduce FDM capabilities on updating the style in a way to not be tied on asset-centric
  const mappedNodes = new TreeIndexNodeCollection();

  const treeIndices: Array<number> = [];
  cadNodes.items.forEach((item) => {
    treeIndices.push(item.treeIndex);
  });

  mappedNodes.updateSet(new IndexSet(treeIndices));

  if (color) {
    model.assignStyledNodeCollection(mappedNodes, {
      color: color,
      outlineColor: outlineColor,
    });
  }
  if (nodeAppearance) {
    model.assignStyledNodeCollection(mappedNodes, nodeAppearance);
  }
};
