import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { formatDate } from '@cognite/cogs.js';

import { isValidFDMDate } from '../../utils/date';
import { toFlatPropertyMap } from '../../utils/object';

export const extractProperties = (item: {
  [x: string]: unknown;
  externalId: string;
  description?: string | undefined;
}) => {
  return Object.entries(item).reduce((acc, [key, value]) => {
    if (key === 'externalId' || key === 'description' || key === 'space') {
      return acc;
    }

    if (value !== undefined && isString(value)) {
      return [...acc, { key, value }];
    }
    if (value !== undefined && isNumber(value)) {
      return [...acc, { key, value: `${value}` }];
    }

    return acc;
  }, [] as { key: string; value: string }[]);
};

export const recursiveConcatItems = (data?: any) => {
  return Object.values(data || []).flatMap(({ items }: any) =>
    items.concat(
      items
        .map((el: any) =>
          Object.values(el)
            .filter(
              (val: any) => val && typeof val === 'object' && 'items' in val
            )
            .map((val: any) => recursiveConcatItems({ val }))
            .flat()
        )
        .flat()
    )
  );
};

const normalizePrimitives = (value?: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  // Fix me + need to build a "in-house" date formatter
  if (isValidFDMDate(value as any)) {
    return formatDate(value as any);
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] !== 'object'
  ) {
    return value.join(', ');
  }

  return null;
};

// Bit of a confusing logic. Need to come back and fix + add tests...
export const flattenProperties = (
  properties?: Record<string, unknown>
): { key: string; value?: string }[] => {
  return Object.keys(properties || {}).reduce((acc, key) => {
    const value = properties?.[key];

    const flattenedValue = normalizePrimitives(value);

    if (flattenedValue !== null) {
      return [...acc, { key, value: flattenedValue }];
    }

    if (typeof value === 'object') {
      const values = toFlatPropertyMap(value || {});

      return [
        ...acc,
        ...Object.keys(values).map((childKey) => {
          const value = normalizePrimitives(values[childKey]);
          return {
            key: `${key}.${childKey}`,
            value: value === null ? JSON.stringify(value) : value,
          };
        }),
      ];
    }

    return [...acc, { key, value: JSON.stringify(value) }];
  }, [] as { key: string; value?: string }[]);
};
