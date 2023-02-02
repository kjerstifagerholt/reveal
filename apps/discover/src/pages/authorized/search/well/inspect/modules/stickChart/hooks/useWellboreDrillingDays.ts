import { useWellInspectWellbores } from 'domain/wells/well/internal/hooks/useWellInspectWellbores';
import { useWellboreDrillingDaysQuery } from 'domain/wells/wellbore/internal/queries/useWellboreDrillingDaysQuery';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';
import { DrillingDays } from 'domain/wells/wellbore/internal/types';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

export const useDrillingDaysData = () => {
  const wellbores = useWellInspectWellbores();
  const { data, isLoading } = useWellboreDrillingDaysQuery(wellbores);

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, DrillingDays>,
        isLoading,
      };
    }

    return {
      data: keyByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
