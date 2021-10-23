import React, { useContext, useEffect } from 'react';
import { Button, Overline } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { BcContainer, BcLabel } from 'components/tables/ModelTable/elements';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  selectBoundaryConditions,
  selectBoundaryConditionsStatus,
} from 'store/boundaryCondition/selectors';
import { fetchBoundaryConditions } from 'store/boundaryCondition/thunks';
import { RequestStatus } from 'store/types';

import { SequenceDataType } from './constants';
import { BodyWithSpacing, TitleWithSpacing } from './elements';

interface Props {
  onClosePanel: () => void;
  data: FileInfoSerializable | undefined;
}

export const BoundaryConditionContent: React.FC<Props> = ({
  data,
  onClosePanel,
}) => {
  const { cdfClient } = useContext(CdfClientContext);
  const dispatch = useAppDispatch();
  const displayValues = useAppSelector(selectBoundaryConditions);
  const displayValuesStatus = useAppSelector(selectBoundaryConditionsStatus);

  const fetchDisplayValues = async () => {
    if (!data || !data.name) {
      return;
    }
    const filter = {
      metadata: {
        dataType: SequenceDataType.BCTimeSeriesMap,
        modelName: data.name,
      },
    };
    if (data.createdTime === undefined) {
      throw new Error('Selected file must have created time');
    }
    dispatch(
      fetchBoundaryConditions({
        client: cdfClient,
        createdTime: data.createdTime,
        filter,
      })
    );
  };

  useEffect(() => {
    fetchDisplayValues();
  }, [data]);

  const failed = displayValuesStatus === RequestStatus.ERROR;
  const success = displayValuesStatus === RequestStatus.SUCCESS;

  return (
    <BcContainer>
      <Button icon="Close" type="ghost" onClick={onClosePanel} />
      <TitleWithSpacing level={2}>{data?.name}</TitleWithSpacing>

      <BodyWithSpacing>
        <BcLabel>Version:</BcLabel>
        {data?.metadata?.version}
      </BodyWithSpacing>
      <BodyWithSpacing>
        <BcLabel>Description:</BcLabel>
        {data?.metadata?.description}
      </BodyWithSpacing>
      <BodyWithSpacing>
        <BcLabel>User:</BcLabel>
      </BodyWithSpacing>
      <Overline>BOUNDARY CONDITIONS</Overline>
      <BodyWithSpacing level={3}>
        {success &&
          displayValues.map((bc) => (
            <div key={bc.label}>
              <BcLabel>{bc.label}:</BcLabel>
              {bc.value} {bc.unit}
            </div>
          ))}
        {failed && <span>No Boundary conditions</span>}
      </BodyWithSpacing>
    </BcContainer>
  );
};
