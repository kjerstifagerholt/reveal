import { formatBigNumbersWithSuffixStringExtended } from '@data-exploration-lib/core';

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText) {
    return true;
  }
  try {
    return value && value.toUpperCase().search(searchText.toUpperCase()) >= 0;
  } catch (e) {
    return false;
  }
};

export const capitalizeFirstLetter = (value?: string) => {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getTabCountLabel = (count: number | string): string => {
  return `${formatBigNumbersWithSuffixStringExtended(count)}`;
};
