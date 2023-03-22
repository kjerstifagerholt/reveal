import * as React from 'react';
import { useMemo } from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import isEmpty from 'lodash/isEmpty';

import { TimePeriod, UpdateTimePeriodProps } from '../../types';
import { getDateRangeForTimePeriod } from '../../utils/getDateRangeForTimePeriod';

export interface TimePeriodSelectProps {
  options: TimePeriod[];
  value?: TimePeriod;
  onChange: (props: UpdateTimePeriodProps) => void;
}

export const TimePeriodSelect: React.FC<TimePeriodSelectProps> = ({
  options,
  value: selectedTimePeriod,
  onChange,
}) => {
  const adaptedOptions = useMemo(() => {
    return options.map((timePeriod) => ({
      label: timePeriod,
      value: timePeriod,
    }));
  }, [options]);

  const handleChange = ({ value: timePeriod }: OptionType<TimePeriod>) => {
    if (!timePeriod) {
      return;
    }
    const dateRange = getDateRangeForTimePeriod(timePeriod);
    onChange({ timePeriod, dateRange });
  };

  if (isEmpty(options)) {
    return null;
  }

  return (
    <Select
      title="Other:"
      width={160}
      theme="grey"
      options={adaptedOptions}
      value={selectedTimePeriod && { label: selectedTimePeriod }}
      onChange={handleChange}
    />
  );
};
