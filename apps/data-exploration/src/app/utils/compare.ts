import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import { isArray } from 'lodash';

export const isObjectEmpty = <T extends Record<string, unknown>>(
  object?: T
) => {
  if (isEmpty(object) || object === undefined || !isObject(object)) {
    return true;
  }

  const isAllPropertiesInObjectEmpty = Object.keys(object).every(key => {
    const value = object[key];

    return (
      value === undefined ||
      value === null ||
      ((isObject(value) || isArray(value)) && isEmpty(value))
    );
  });

  return isAllPropertiesInObjectEmpty;
};
