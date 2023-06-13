import {
  PointsOfInterestCollection,
  PointOfInterest,
  useInfiniteChecklistItems,
  APMConfigNode,
} from '../hooks';

export const useInfinitePointsOfInterestCollections = (
  apmConfig: APMConfigNode | undefined
) => {
  const {
    data: fdmChecklistResponse,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteChecklistItems(undefined, apmConfig);

  const pointsOfInterestCollections: PointsOfInterestCollection[] =
    fdmChecklistResponse?.pages?.flatMap((page): PointsOfInterestCollection[] =>
      page?.data?.listAPM_Checklist.items.map(
        (fdmChecklistItem): PointsOfInterestCollection => {
          const pointsOfInterest = fdmChecklistItem.items.items.flatMap(
            (item): PointOfInterest[] =>
              item.observations.items.map(
                (observation): PointOfInterest => ({
                  title: item.title,
                  description: observation.description,
                  fileIds: observation.fileIds,
                  position: observation.position,
                })
              )
          );

          return {
            externalId: fdmChecklistItem.externalId,
            title: fdmChecklistItem.title,
            description: fdmChecklistItem.description,
            pointsOfInterest,
            status: fdmChecklistItem.status,
            applied: false,
          };
        }
      )
    ) ?? [];
  return {
    pointsOfInterestCollections,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
