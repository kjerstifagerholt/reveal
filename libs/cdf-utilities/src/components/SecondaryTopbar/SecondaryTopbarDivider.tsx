import React from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

type SecondaryTopbarDividerProps = {
  className?: string;
};

const SecondaryTopbarDivider = ({
  className,
}: SecondaryTopbarDividerProps): JSX.Element => {
  return <StyledDivider className={className} />;
};

const StyledDivider = styled.div`
  background-color: ${Colors['border--muted']};
  height: 20px;
  margin: 0 16px;
  width: 1px;
`;

export default SecondaryTopbarDivider;
