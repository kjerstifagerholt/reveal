import { NDS_ACCESSORS } from 'domain/wells/dataLayer/nds/selectors/accessors';

import { ColumnType } from 'components/Tablev3';
import { UserPreferredUnit } from 'constants/units';

import { ValueLabel } from '../../../common/Table/ValueLabel';
import { NdsView } from '../../types';

export const getCommonColumns = (
  unit: UserPreferredUnit
): ColumnType<NdsView>[] => {
  return [
    {
      Header: 'Risk Type',
      accessor: NDS_ACCESSORS.RISK_TYPE,
      width: '140px',
    },
    {
      Header: 'Severity',
      id: NDS_ACCESSORS.SEVERITY,
      Cell: ({ row }) => ValueLabel(row.original.severity),
      width: '140px',
    },
    {
      Header: 'Probability',
      id: NDS_ACCESSORS.PROBABILITY,
      Cell: ({ row }) => ValueLabel(row.original.probability),
      width: '140px',
    },
    {
      Header: 'Subtype',
      accessor: NDS_ACCESSORS.SUBTYPE,
      width: '200px',
    },
    {
      Header: `Diameter hole (${unit})`,
      accessor: NDS_ACCESSORS.DIAMETER_HOLE,
      width: '140px',
    },
    {
      Header: `MD hole start (${unit})`,
      accessor: NDS_ACCESSORS.MD_HOLE_START,
      width: '140px',
    },
    {
      Header: `MD hole end (${unit})`,
      accessor: NDS_ACCESSORS.MD_HOLE_END,
      width: '140px',
    },
    {
      Header: `TVD offset hole start (${unit})`,
      accessor: NDS_ACCESSORS.TVD_HOLE_START,
      width: '140px',
    },
    {
      Header: `TVD offset hole end (${unit})`,
      accessor: NDS_ACCESSORS.TVD_HOLE_END,
      width: '140px',
    },
  ];
};
