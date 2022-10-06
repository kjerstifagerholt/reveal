import {
  Colors,
  Detail,
  Elevations,
  Flex,
  Icon,
  IconType,
  Overline,
} from '@cognite/cogs.js';
import { Handle, Position, useNodes } from 'react-flow-renderer';
import styled from 'styled-components';

import { CustomNodeData } from 'components/custom-node';
import { isConnectionValid } from 'utils';

const BASE_NODE_HANDLE_SIZE_IN_PX = 12;

type BaseNodeProps = {
  children: React.ReactNode;
  description?: string;
  icon: IconType;
  title: string;
};

export const BaseNode = ({
  children,
  description,
  icon,
  title,
}: BaseNodeProps): JSX.Element => {
  const nodes = useNodes<CustomNodeData>();

  return (
    <StyledBaseNodeContainer>
      <StyledBaseHandleLeft
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Left}
        type="target"
      />
      <StyledBaseHandleRight
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Right}
        type="source"
      />
      <StyledBaseNodeHeader>
        <Flex gap={8}>
          <StyledBaseNodeIconContainer>
            <StyledBaseNodeIcon type={icon} />
          </StyledBaseNodeIconContainer>
          <Flex direction="column" gap={2}>
            <StyledBaseNodeTitle level={3}>{title}</StyledBaseNodeTitle>
            {!!description && (
              <StyledBaseNodeDescription>
                {description}
              </StyledBaseNodeDescription>
            )}
          </Flex>
        </Flex>
      </StyledBaseNodeHeader>
      {children}
    </StyledBaseNodeContainer>
  );
};

const StyledBaseHandle = styled(Handle)`
  background-color: transparent;
  border: none;
  border-radius: 0;
  height: 100%;
  width: ${BASE_NODE_HANDLE_SIZE_IN_PX}px;
`;

const StyledBaseNodeContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px 0 0 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  height: 80px;
  width: 300px;

  ${StyledBaseHandle}.react-flow__handle-left.react-flow__handle-connecting {
    background-color: ${Colors['surface--status-critical--muted--default']};
  }

  ${StyledBaseHandle}.react-flow__handle-left.react-flow__handle-valid {
    background-color: ${Colors['surface--status-success--muted--default']};
  }

  :hover {
    border-radius: 0;
  }
`;

const StyledBaseHandleRight = styled(StyledBaseHandle)`
  background-color: ${Colors['text-icon--interactive--default']};
  border-radius: 0 6px 6px 0;
  right: -${BASE_NODE_HANDLE_SIZE_IN_PX}px;

  :hover {
    background-color: ${Colors['text-icon--interactive--hover']};
  }
`;

const StyledBaseHandleLeft = styled(StyledBaseHandle)`
  border-radius: 6px 0 0 6px;
  left: -${BASE_NODE_HANDLE_SIZE_IN_PX}px;
`;

const StyledBaseNodeHeader = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  padding: 8px;
`;

const StyledBaseNodeIconContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--interactive--toggled-default']};
  border-radius: 4px;
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledBaseNodeIcon = styled(Icon)`
  color: ${Colors['text-icon--interactive--default']};
`;

const StyledBaseNodeTitle = styled(Overline)`
  color: ${Colors['text-icon--interactive--default']};
`;

const StyledBaseNodeDescription = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled']};
`;
