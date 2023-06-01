import {
  Avatar,
  AvatarGroup,
  Button,
  Colors,
  Flex,
  Menu,
} from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { getContainer } from 'utils';
import { useTranslation } from 'common';
import FlowSaveIndicator from '../../pages/flow/FlowSaveIndicator';
import { toPng } from 'html-to-image';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useState } from 'react';
import EditWorkflowModal from 'components/workflow-modal/EditWorkflowModal';
import {
  WorkflowDefinitionCreate,
  WorkflowWithVersions,
  useCreateWorkflowDefinition,
} from 'hooks/workflows';
import {
  convertCanvasToWorkflowDefinition,
  getLastVersion,
} from 'utils/workflows';

type CanvasTopBarProps = {
  workflow: WorkflowWithVersions;
};

export const CanvasTopBar = ({ workflow }: CanvasTopBarProps) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { mutate: createWorkflowDefinition } = useCreateWorkflowDefinition();

  const { flow, setHistoryVisible, userState, otherUserStates } =
    useWorkflowBuilderContext();
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  const downloadCanvasToImage = (dataUrl: string) => {
    const a = document.createElement('a');

    a.setAttribute('download', flow?.name);
    a.setAttribute('href', dataUrl);
    a.click();
  };

  const handleDownloadToPNG = () => {
    toPng(document.querySelector('.react-flow') as HTMLElement, {
      filter: (node) => {
        // we don't want to add the controls to the image
        if (node?.classList?.contains('react-flow__controls')) {
          return false;
        }

        return true;
      },
    }).then(downloadCanvasToImage);
  };

  const handlePublish = () => {
    const tasks = convertCanvasToWorkflowDefinition(flow);
    const workflowDefinition: WorkflowDefinitionCreate = {
      tasks,
      description: '',
    };

    const lastVersion = parseInt(getLastVersion(workflow)?.version ?? '');
    const nextVersion = lastVersion ? lastVersion + 1 : 1;

    createWorkflowDefinition({
      externalId: workflow.externalId,
      version: `${nextVersion}`,
      workflowDefinition,
    });
  };

  return (
    <Container>
      <SecondaryTopbar
        title={flow.name}
        goBackFallback={createLink(`/${subAppPath}`)}
        extraContent={
          <Flex alignItems="center">
            <Flex>
              <FlowSaveIndicator />
            </Flex>
            <SecondaryTopbar.Divider />
            <Avatar text={userState.name ?? userState.connectionId} />
            <AvatarGroup>
              {otherUserStates.map(({ connectionId, name }) => (
                <Avatar key={connectionId} text={name ?? connectionId} />
              ))}
            </AvatarGroup>
            <SecondaryTopbar.Divider />
            <Flex gap={12}>
              <Button onClick={handlePublish} type="primary">
                {t('publish-version')}
              </Button>
            </Flex>
          </Flex>
        }
        optionsDropdownProps={{
          appendTo: getContainer(),
          hideOnSelect: {
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          },
          content: (
            <Menu>
              <Menu.Item
                icon="Settings"
                iconPlacement="left"
                onClick={() => setShowUpdateModal(true)}
              >
                General info
              </Menu.Item>
              <Menu.Item
                icon="Download"
                iconPlacement="left"
                onClick={handleDownloadToPNG}
              >
                {t('download-png')}
              </Menu.Item>
              <Menu.Item
                icon="History"
                iconPlacement="left"
                key="history"
                onClick={() => setHistoryVisible((visible) => !visible)}
              >
                {t('history')}
              </Menu.Item>
            </Menu>
          ),
        }}
      />
      <EditWorkflowModal
        showWorkflowModal={showUpdateModal}
        setShowWorkflowModal={setShowUpdateModal}
      />
    </Container>
  );
};

const Container = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;
