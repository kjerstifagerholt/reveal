import { useMemo } from 'react';

import { ColumnType } from 'components/Tablev3';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { Body2DefaultStrong } from '../../../common/Table/Body2DefaultStrong';
import { CasingSchematicView } from '../../types';

import { getCommonColumns } from './getCommonColumns';

export const useCasingsTableCommonColumns =
  (): ColumnType<CasingSchematicView>[] => {
    const { data: userPreferredUnit } = useUserPreferencesMeasurement();
    return useMemo(
      () => getCommonColumns(userPreferredUnit),
      [userPreferredUnit]
    );
  };

export const useCasingsWellsTableColumns =
  (): ColumnType<CasingSchematicView>[] => {
    return [
      {
        id: 'well-wellbore',
        Header: 'Well / Wellbore',
        width: '300px',
        maxWidth: 'auto',
        Cell: ({ row }) => Body2DefaultStrong(row.original.wellName),
        stickyColumn: true,
      },
      ...useCasingsTableCommonColumns(),
    ];
  };

export const useCasingsWellboresTableColumns =
  (): ColumnType<CasingSchematicView>[] => {
    return [
      {
        id: 'wellbore',
        Header: 'Wellbore',
        width: '300px',
        maxWidth: 'auto',
        Cell: ({ row }) => Body2DefaultStrong(row.original.wellboreName),
        stickyColumn: true,
      },
      ...useCasingsTableCommonColumns(),
    ];
  };
