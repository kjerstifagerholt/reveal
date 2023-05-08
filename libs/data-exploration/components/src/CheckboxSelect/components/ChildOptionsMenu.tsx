import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

import {
  OptionSelection,
  ChildOptionType,
  CustomMetadataValue,
} from '../types';
import { getChildOptionsSelection } from '../utils/getChildOptionsSelection';

import { OptionsMenu } from './OptionsMenu';
import { useDebouncedState } from '@data-exploration-lib/core';

export interface ChildOptionsMenuProps {
  parentOptionValue: string;
  options?: Array<ChildOptionType>;
  selection: OptionSelection;
  onChange: (selection: OptionSelection) => void;
  enableSorting?: boolean;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
}

export const ChildOptionsMenu = ({
  parentOptionValue,
  options: customOptions,
  selection,
  onChange,
  useCustomMetadataValuesQuery,
  enableSorting,
}: ChildOptionsMenuProps) => {
  const [query, setQuery] = useDebouncedState<string>('');
  const [totalOptionCount, setTotalOptionCount] = React.useState<number>(0);

  const isCustomOptions = customOptions === undefined;

  const data = useCustomMetadataValuesQuery?.(parentOptionValue, query, {
    enabled: isCustomOptions,
    keepPreviousData: true,
  });

  const options = React.useMemo(() => {
    if (!isCustomOptions) {
      return customOptions || [];
    }

    return data?.options || [];
  }, [isCustomOptions, data?.options, customOptions]);

  React.useEffect(() => {
    if (query === '') {
      setTotalOptionCount(options.length);
    }
  }, [query, options.length]);

  // if (!options || isEmpty(options)) {
  //   return null;
  // }

  const handleChildOptionChange = (
    childOptionValues: string[],
    isAllSelected: boolean
  ) => {
    if (isEmpty(childOptionValues)) {
      onChange(omit(selection, parentOptionValue));
      return;
    }

    const newSelection = {
      ...selection,
      [parentOptionValue]: isAllSelected ? [] : childOptionValues,
    };

    onChange(newSelection);
  };

  return (
    <OptionsMenu
      isLoading={isCustomOptions && data?.isLoading}
      options={options}
      selection={getChildOptionsSelection(
        options,
        selection[parentOptionValue]
      )}
      onSearchInputChange={(newValue) => setQuery(newValue)}
      onChange={(childOptionsSelection) => {
        const selectedOptions = Object.keys(childOptionsSelection);

        handleChildOptionChange(
          selectedOptions,
          selectedOptions.length === totalOptionCount
        );
      }}
      enableSorting={enableSorting}
      disableOptionsMenu
    />
  );
};
