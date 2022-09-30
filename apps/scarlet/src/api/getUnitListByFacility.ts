import { CogniteClient } from '@cognite/sdk';
import { DataSetId, UnitListByFacility, UnitListItem } from 'types';
import { facilityList } from 'config';

export const getUnitListByFacility = async (
  client: CogniteClient
): Promise<UnitListByFacility> => {
  const unitsByFacilityId = facilityList.reduce((result, facility) => {
    if (!facility.id) return result;
    return { ...result, [facility.id]: [] };
  }, {} as UnitListByFacility);

  let next;
  let list = await client.assets.list({
    filter: {
      parentExternalIds: facilityList.map((f) => f.id),
      dataSetIds: [{ id: DataSetId.P66_PCMS }],
      labels: { containsAll: [{ externalId: 'Unit' }] },
    },
    limit: 1000,
  });

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items.forEach((item) => {
      const facility = facilityList.find(
        (facility) => facility.id === item.parentExternalId
      );

      if (!facility) return;
      unitsByFacilityId[facility.id].push({
        id: item.name,
        cdfId: item.id,
        externalId: item.externalId,
        number: facility.unitPattern
          ? getUnitNumber(item.name, facility.unitPattern)
          : item.name,
      } as UnitListItem);
    });

    next = list.next;
  } while (list.next);

  return unitsByFacilityId;
};

const getUnitNumber = (unitId: string, unitPattern: RegExp) => {
  const matches = unitId.match(unitPattern);
  if (matches) return parseFloat(matches[1]);

  return undefined;
};
