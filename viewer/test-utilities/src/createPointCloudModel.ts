/*!
 * Copyright 2022 Cognite AS
 */

import { Mock } from 'moq.ts';
import {
  CognitePointCloudModel,
  PointCloudNode,
  PointCloudObjectAnnotationData,
  PointCloudOctree,
  Potree,
  PotreeGroupWrapper,
  PotreeNodeWrapper
} from '../../packages/pointclouds';

import * as THREE from 'three';

import { LocalModelDataProvider } from '../../packages/data-providers';
import { IPointCloudTreeGeometry } from '../../packages/pointclouds/src/potree-three-loader/geometry/IPointCloudTreeGeometry';

export function createPointCloudModel(modelId: number, revisionId: number): CognitePointCloudModel {
  const modelDataProvider = new LocalModelDataProvider();
  const potreeInstance = new Potree(modelDataProvider);

  const potreeGroup = new PotreeGroupWrapper(potreeInstance);
  const pointCloudOctree = new PointCloudOctree(
    new Mock<Potree>().object(),
    new Mock<IPointCloudTreeGeometry>()
      .setup(p => p.boundingBox)
      .returns(new THREE.Box3())
      .setup(p => p.offset)
      .returns(new THREE.Vector3())
      .setup(p => p.tightBoundingBox)
      .returns(new THREE.Box3())
      .object(),
    new PointCloudObjectAnnotationData([])
  );

  const nodeWrapper = new PotreeNodeWrapper(pointCloudOctree, [], Symbol('dummy'), { classificationSets: [] });

  const pointCloudNode = new PointCloudNode(potreeGroup, nodeWrapper);

  const pointCloudModel = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);

  return pointCloudModel;
}
