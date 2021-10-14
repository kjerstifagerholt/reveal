import { useMemo } from 'react';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { Modules } from 'modules/sidebar/types';
import { FilterConfig } from 'modules/wellSearch/types';
import { filterConfigs } from 'modules/wellSearch/utils/sidebarFilters';
import { WellConfig } from 'tenants/types';

export const useFilterConfigByCategory = () => {
  const { data: config } = useTenantConfigByKey<WellConfig>(Modules.WELLS);
  return useMemo(() => {
    const filteredConfigData = filterConfigs(
      useUserPreferencesMeasurement()
    ).filter((item) => {
      if (!item.key) return true;
      const filterItem = get(config, item.key);
      return filterItem?.enabled;
    });
    return filterCategoricalData(filteredConfigData);
  }, [config]);
};

export const filterCategoricalData = (filteredConfigData: FilterConfig[]) => {
  return Object.values(groupBy(filteredConfigData, 'category')).map(
    (categoryFilterConfigs) => ({
      title: head(categoryFilterConfigs)?.category || '',
      filterConfigs: categoryFilterConfigs,
      filterConfigIds: categoryFilterConfigs.map(
        (filterConfig) => filterConfig.id
      ),
    })
  );
};
