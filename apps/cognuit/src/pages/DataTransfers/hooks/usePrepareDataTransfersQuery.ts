import { useEffect, useState } from 'react';
import set from 'date-fns/set';
import { format } from 'date-fns';
import { useDataTransfersState } from 'contexts/DataTransfersContext';
import { RESTTransfersFilter } from 'typings/interfaces';
import { useDataTransfersQuery } from 'services/endpoints/datatransfers/query';
import isEmpty from 'lodash/isEmpty';

export function usePrepareDataTransfersQuery() {
  const [options, setOptions] = useState<RESTTransfersFilter>({});

  const {
    data: datatransfers,
    refetch,
    ...rest
  } = useDataTransfersQuery({
    enabled: !isEmpty(options),
    options,
  });

  const {
    filters: {
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      selectedSourceProject,
      selectedTargetProject,
      selectedDateRange,
      selectedDatatype,
    },
  } = useDataTransfersState();

  useEffect(() => {
    const isFiltersSelected =
      selectedConfiguration ||
      (selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject);

    if (isFiltersSelected) {
      let buildOptions: RESTTransfersFilter = {};

      if (
        selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject
      ) {
        buildOptions = {
          source: {
            source: selectedSource,
            instance: selectedSourceProject.instance,
            external_id: selectedSourceProject.external_id,
          },
          target: {
            source: selectedTarget,
            instance: selectedTargetProject.instance,
            external_id: selectedTargetProject.external_id,
          },
        };
      }
      if (selectedDateRange) {
        let { startDate, endDate } = selectedDateRange;
        if (startDate && endDate) {
          startDate = set(startDate, { hours: 0, minutes: 0, seconds: 0 });
          endDate = set(endDate, { hours: 23, minutes: 59, seconds: 59 });
          buildOptions.updated_after = Number(format(startDate, 't'));
          buildOptions.updated_before = Number(format(endDate, 't'));
        }
      }
      if (selectedConfiguration) {
        buildOptions.configuration = selectedConfiguration.name;
      }
      if (selectedDatatype) {
        buildOptions.datatypes = [selectedDatatype];
      }

      setOptions(buildOptions);
    }
  }, [
    selectedConfiguration,
    selectedSource,
    selectedSourceProject,
    selectedTarget,
    selectedTargetProject,
  ]);

  return { data: datatransfers, ...rest };
}
