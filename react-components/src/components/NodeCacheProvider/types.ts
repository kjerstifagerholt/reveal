/*!
 * Copyright 2023 Cognite AS
 */
import { type AnnotationModel, type AnnotationsBoundingVolume, type Node3D } from '@cognite/sdk';
import { type EdgeItem, type DmsUniqueIdentifier, type Source } from '../../utilities/FdmSDK';
import { type InModel3dEdgeProperties } from '../../utilities/globalDataModels';

export type FdmCadEdge = EdgeItem<InModel3dEdgeProperties>;
export type FdmEdgeWithNode = { edge: FdmCadEdge; cadNode: Node3D; view?: Source };

export type CadNodeWithFdmIds = { cadNode: Node3D; fdmIds: DmsUniqueIdentifier[] };
export type CadNodeWithEdges = { cadNode: Node3D; edges: FdmCadEdge[] };
export type FdmNodeDataPromises = {
  cadAndFdmNodesPromise: Promise<CadNodeWithFdmIds | undefined>;
  viewsPromise: Promise<Source[] | undefined>;
};

export type ModelRevisionAssetNodesResult = {
  modelId: ModelId;
  revisionId: RevisionId;
  assetToNodeMap: Map<AssetId, Node3D>;
};

export type AncestorQueryResult = {
  edges: FdmCadEdge[];
  ancestorsWithSameMapping: Node3D[];
  firstMappedAncestorTreeIndex: number;
};

export type ModelId = number;
export type RevisionId = number;
export type TreeIndex = number;
export type NodeId = number;
export type AssetId = number;
export type FdmId = DmsUniqueIdentifier;

export type ModelRevisionId = { modelId: number; revisionId: number };

export type ModelRevisionKey = `${ModelId}/${RevisionId}`;
export type FdmKey = `${string}/${string}`;
export type ModelNodeIdKey = `${ModelId}/${RevisionId}/${NodeId}`;
export type ModelAssetIdKey = `${ModelId}/${RevisionId}/${AssetId}`;

export type ModelRevisionToEdgeMap = Map<ModelRevisionKey, FdmEdgeWithNode[]>;

export type PointCloudAnnotationModel = AnnotationModel & { data: AnnotationsBoundingVolume };
