import React from 'react';
import { Icon } from 'antd';
import { Tooltip } from '@cognite/cogs.js';
import { useSchedules } from 'utils/hooks';

type Props = {
  externalId?: string;
};
export default function FunctionScheduleIndicator({ externalId }: Props) {
  const { data: scheduleResponse } = useSchedules();

  const schedules =
    scheduleResponse?.filter(s => s.functionExternalId === externalId) || [];

  if (schedules.length > 0) {
    return (
      <Tooltip placement="top" content={`Has ${schedules.length} schedules`}>
        <Icon
          type="clock-circle"
          theme="twoTone"
          style={{ marginLeft: '8px' }}
        />
      </Tooltip>
    );
  }
  return null;
}
