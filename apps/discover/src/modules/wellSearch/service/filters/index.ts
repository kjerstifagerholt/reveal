import { filterConfigs } from 'modules/wellSearch/utils/sidebarFilters';

export function getFilterOptions(prefferedUnit: string): Promise<any> {
  const filterFetchers = filterConfigs(prefferedUnit).filter(
    (filterConfig) => filterConfig.fetcher
  );
  return Promise.all(
    filterFetchers.map(
      (filterConfig) =>
        filterConfig.fetcher && filterConfig.fetcher()?.catch(() => [])
    )
  ).then(
    (responses) =>
      filterFetchers.reduce(
        (prev, current, index) => ({
          ...prev,
          [current.id]: (responses[index] as string[]).map((value) => ({
            value,
          })),
        }),
        {}
      ),
    () => ({})
  );
}
