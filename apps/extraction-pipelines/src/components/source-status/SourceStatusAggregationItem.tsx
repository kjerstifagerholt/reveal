import React from 'react';

import { Colors, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';

import { UptimeAggregation } from 'utils/hostedExtractors';
import { useTranslation } from 'common';

type SourceStatusAggregationItemProps = {
  aggregation: UptimeAggregation;
};

const renderAggregationItem = (uptimePercentage: number) => {
  if (uptimePercentage === 100) {
    return <AggregationItemSuccess />;
  }

  if (uptimePercentage === -1) {
    return <AggregationItemNoData />;
  }

  return <AggregationItemError />;
};

export const SourceStatusAggregationItem = ({
  aggregation,
}: SourceStatusAggregationItemProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div style={{ flex: 1 }}>
      <Tooltip
        content={
          aggregation.uptimePercentage === -1
            ? t('source-status-no-data')
            : t('uptime-with-percentage', {
                percentage: aggregation.uptimePercentage.toFixed(5),
              })
        }
      >
        {renderAggregationItem(aggregation.uptimePercentage)}
      </Tooltip>
    </div>
  );
};

const AggregationItemBase = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  height: 32px;
  padding: 0;
  width: 100%;
`;

const AggregationItemNoData = styled(AggregationItemBase)`
  background-color: ${Colors['surface--status-undefined--muted--default']};
  cursor: unset;

  :hover {
    background-color: ${Colors['surface--status-undefined--muted--hover']};
  }
`;

const AggregationItemError = styled(AggregationItemBase)`
  background-color: ${Colors['surface--status-critical--strong--default']};

  :hover {
    background-color: ${Colors['surface--status-critical--strong--hover']};
  }

  :active {
    background-color: ${Colors['surface--status-critical--strong--pressed']};
  }
`;

const AggregationItemSuccess = styled(AggregationItemBase)`
  background-color: ${Colors['decorative--green--400']};

  :hover {
    background-color: ${Colors['decorative--green--500']};
  }

  :active {
    background-color: ${Colors['decorative--green--600']};
  }
`;
