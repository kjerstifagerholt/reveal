import React, { FunctionComponent, useEffect, useState } from 'react';
import { useExtpipes } from 'hooks/useExtpipes';
import NoExtpipes from 'components/error/NoExtpipes';
import { Button, Flex, Loader, Modal, Title } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import { StyledTooltip, PageWrapperColumn } from 'components/styled';
import ExtpipesTable from 'components/table/ExtpipesTable';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';
import { CreateExtpipe } from 'pages/create/CreateExtpipe';

import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import ExtpipesTableSearch from 'components/table/ExtpipesTableSearch';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

const CreateExtpipeModal = (props: {
  title: string;
  visible: boolean;
  close: () => void;
}) => {
  return (
    <Modal
      visible={props.visible}
      width={600}
      closable
      onCancel={props.close}
      appElement={document.getElementsByClassName(styleScope).item(0)!}
      getContainer={getContainer}
      footer={null}
      title={props.title}
    >
      <VerticalSpace />
      <CreateExtpipe customCancelCallback={props.close} />
    </Modal>
  );
};

interface OwnProps {}

type Props = OwnProps;

const Extpipes: FunctionComponent<Props> = () => {
  const { t } = useTranslation();
  useEffect(() => {
    trackUsage({ t: 'Overview' });
  }, []);

  const { data, isLoading, error: errorExtpipes, refetch } = useExtpipes(20);

  const canEdit = true;
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const onClickCreateButton = () => {
    if (canEdit && !createModalOpen) {
      trackUsage({ t: 'Create.DialogOpened' });
      setCreateModalOpen(true);
    }
  };
  const closeCreateDialog = () => {
    trackUsage({ t: 'Create.DialogClosed' });
    setCreateModalOpen(false);
  };

  const createExtpipeButton = (
    <StyledTooltip disabled={canEdit} content={t('no-create-access')}>
      <Button
        variant="default"
        type="primary"
        icon="AddLarge"
        disabled={!canEdit}
        onClick={onClickCreateButton}
      >
        {t('create-ext-pipeline')}
      </Button>
    </StyledTooltip>
  );

  if (isLoading) {
    return <Loader />;
  }

  if (data?.pages?.[0]?.items.length === 0) {
    return (
      <>
        <CreateExtpipeModal
          visible={createModalOpen}
          close={() => setCreateModalOpen(false)}
          title={t('create-ext-pipeline')}
        />
        <NoExtpipes actionButton={createExtpipeButton} />
      </>
    );
  }

  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorExtpipes) {
    if (errorExtpipes.status === 403) {
      return (
        <ErrorFeedback
          onClick={handleErrorDialogClick}
          fallbackTitle={t('list-extaction-pipelines-error-403')}
          btnText="Retry"
        />
      );
    }
    return (
      <ErrorFeedback
        btnText="Retry"
        onClick={handleErrorDialogClick}
        fallbackTitle={t('fail-to-get-ext-pipeline')}
        contentText={t('try-again-later')}
        error={errorExtpipes}
      />
    );
  }

  return (
    <StyledContainer>
      <CreateExtpipeModal
        visible={createModalOpen}
        close={closeCreateDialog}
        title={t('create-ext-pipeline')}
      />
      <StyledActionBar>
        <ExtpipesTableSearch onChange={setSearchQuery} value={searchQuery} />
        {createExtpipeButton}
      </StyledActionBar>
      <ExtpipesTable search={searchQuery} />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-top: 24px;
  width: 100%;
`;

const StyledActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export default function CombinedComponent() {
  const { t } = useTranslation();
  return (
    <StyledPageContainer>
      <PageWrapperColumn>
        <Title level={3}>{t('extraction-pipeline', { count: 0 })}</Title>
        <Flex>
          <Extpipes />
        </Flex>
      </PageWrapperColumn>
    </StyledPageContainer>
  );
}

const VerticalSpace = styled.div`
  height: 16px;
`;

const StyledPageContainer = styled.div`
  padding: 0 16px;
`;
