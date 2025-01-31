/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmNodeCache } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type DmsUniqueIdentifier, useReveal } from '../index';
import { type Node3D } from '@cognite/sdk';

export const use3dNodeByExternalId = ({
  externalId,
  space
}: Partial<DmsUniqueIdentifier>): UseQueryResult<Node3D> => {
  const viewer = useReveal();
  const fdmNodeCache = useFdmNodeCache();

  return useQuery(
    ['reveal', 'react-components', '3dNodeByExternalId', externalId, space],
    async () => {
      if (externalId === undefined || space === undefined) {
        await Promise.reject(
          new Error(`No externalId and space provided to use3dNodeByExternalId hook`)
        );
        return;
      }

      const modelsRevisionIds = viewer.models.map((model) => ({
        modelId: model.modelId,
        revisionId: model.revisionId
      }));

      const modelMappings = (
        await fdmNodeCache.cache.getMappingsForFdmIds([{ externalId, space }], modelsRevisionIds)
      ).find((model) => model.mappings.size > 0);

      const node3d = modelMappings?.mappings.get(externalId)?.[0];

      if (node3d === undefined) {
        await Promise.reject(
          new Error(`Could not find a connected model to instance ${externalId} in space ${space}`)
        );
        return;
      }

      return node3d;
    }
  );
};
