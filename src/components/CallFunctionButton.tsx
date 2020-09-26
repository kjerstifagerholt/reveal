import React, { useState } from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useQuery } from 'react-query';

import { CogFunction } from 'types';
import CallFunctionModal from 'components/FunctionModals/CallFunctionModal';

type Props = {
  id: number;
};

export default function CallFunctionButton({ id }: Props) {
  const { data: fn } = useQuery<CogFunction>(`/functions/${id}`);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Tooltip placement="top" content="Click to call the function">
        <Button
          icon="TriangleRight"
          size="small"
          style={{
            justifyContent: 'center',
          }}
          disabled={fn?.status !== 'Ready'}
          onClick={e => {
            e.stopPropagation();
            setShowModal(true);
          }}
        />
      </Tooltip>
      {showModal ? (
        <CallFunctionModal id={id} closeModal={() => setShowModal(false)} />
      ) : null}
    </>
  );
}
