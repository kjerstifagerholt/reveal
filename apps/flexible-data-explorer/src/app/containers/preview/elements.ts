import styled from 'styled-components';

import { Body, Button, Title } from '@cognite/cogs.js';

export const InstancePreviewHeader = styled.div`
  display: flex;
  flex-direction: column;
  & > *:first-child {
    margin-bottom: 4px;
  }

  margin-bottom: 8px;
`;

export const TitleText = styled(Title).attrs({ level: 5, strong: true })`
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DescriptionText = styled(Body).attrs({ level: 4 })`
  color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeaderText = styled(Body).attrs({ strong: true })`
  color: var(--border-status-neutral-strong, #4078f0);
  font-size: 12px;
`;

export const InstancePreviewContainer = styled.div`
  width: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 1px 2px 0px rgba(79, 82, 104, 0.24),
    0px 1px 8px 0px rgba(79, 82, 104, 0.08),
    0px 1px 16px 4px rgba(79, 82, 104, 0.1);
`;

export const InstancePreviewContent = styled.div`
  padding: 20px 12px;
  max-height: 456px;
  transition: max-height 0.2s ease-in-out;
  overflow: auto;
`;

export const InstancePreviewFooter = styled.div`
  padding: 8px;
  border-top: 1px solid
    var(--border-interactive-default, rgba(83, 88, 127, 0.16));
`;

export const OpenButton = styled(Button)`
  width: 100%;
  height: 40px;
`;
