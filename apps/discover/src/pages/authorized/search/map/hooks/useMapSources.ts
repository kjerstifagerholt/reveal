import { useDataFeatures } from 'modules/map/hooks/useDataFeatures';
import { useMap } from 'modules/map/selectors';
import { useSeismicMapFeatures } from 'modules/seismicSearch/hooks/useSeismicMapFeatures';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';

import { useDeepMemo } from '../../../../../hooks/useDeep';
import { useMapContent } from '../hooks';
import { createSources } from '../utils';

export const useMapSources = () => {
  const sources = useMapContent();
  const seismicCollection = useSeismicMapFeatures();
  const { selectedLayers } = useMap();

  const externalWells = useDeepMemo(() => {
    return sources?.find((source) => source.id === WELL_HEADS_LAYER_ID);
  }, [sources]);

  const features = useDataFeatures(
    selectedLayers,
    externalWells?.data.features || []
  );

  const resultSources = useDeepMemo(
    () => createSources(seismicCollection, features),
    [features, seismicCollection]
  );

  const combinedSources = useDeepMemo(
    () =>
      sources
        ? [
            ...sources.filter((source) => source.id !== WELL_HEADS_LAYER_ID),
            ...resultSources,
          ]
        : [],
    [resultSources, sources]
  );

  return [combinedSources];
};
