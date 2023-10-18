import React from 'react';

import styled from 'styled-components';

import { Body, Icon, Title, Tooltip } from '@cognite/cogs.js';

import { ModalConfirm } from '../../components/confirm/ModalConfirm';
import { useProjectConfig, useSelectedSiteConfig } from '../../hooks/useConfig';
import { useDataModelsLocalStorage } from '../../hooks/useLocalStorage';
import { useAISearchParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useSelectedDataModels } from '../../services/useSelectedDataModels';
import { SiteSelection } from '../site/SiteSelection';

interface Props {
  header?: boolean;
}

// NOTE: This component is, with a lack of a better word, a mess (this still stands)!! Align it better with design
export const SearchConfiguration: React.FC<Props> = ({ header }) => {
  const { t } = useTranslation();

  const [isAIEnabled] = useAISearchParams();
  const config = useProjectConfig();
  const selectedSite = useSelectedSiteConfig();
  const selectedDataModels = useSelectedDataModels();
  const [, setSelectedDataModels] = useDataModelsLocalStorage();

  const dataModels = selectedDataModels?.map((item) => item.externalId);

  const shouldShowSiteSelection = config?.sites;
  const shouldShowDataModelSelection =
    !config || selectedSite?.name === 'Custom';

  const Wrapper: any = header ? Title : MainTextBody;

  return (
    <Container>
      <Wrapper level={header ? 3 : 6} style={{ display: 'flex', gap: '8px' }}>
        {header
          ? t(isAIEnabled ? 'AI_HOMEPAGE_HEADER' : 'HOMEPAGE_HEADER')
          : t('SEARCH_RESULTS_HEADER')}

        {shouldShowSiteSelection && (
          <SiteSelection>
            <StyledBody $isHeader={header}>
              {selectedSite?.name}
              <Icon type="ChevronDown" />
            </StyledBody>
          </SiteSelection>
        )}

        {shouldShowDataModelSelection && (
          <ModalConfirm
            title="Are you sure you want to change the data models?"
            content="By confirming, you will lose all your current selections!"
          >
            <StyledBody
              onClick={() => setSelectedDataModels(undefined)}
              $isHeader={header}
            >
              {dataModels?.splice(0, 2).join(', ') || '...'}
              <Tooltip wrapped content={dataModels?.join(', ')}>
                <>
                  {dataModels &&
                    dataModels.length > 0 &&
                    `, +${dataModels?.length}`}
                </>
              </Tooltip>
            </StyledBody>
          </ModalConfirm>
        )}
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  padding-top: 8px;
  padding-bottom: 8px;
  overflow-x: clip;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBody = styled.p<{ $isHeader?: boolean }>`
  display: inline-flex;
  margin-bottom: 0;
  align-items: center;
  color: rgba(51, 51, 51, 0.6);
  font-size: ${({ $isHeader }) => ($isHeader ? '24px' : '14px')};
  margin-bottom: 0px;
  overflow-x: clip;
  text-overflow: ellipsis;

  &:hover {
    cursor: pointer;
    color: rgba(51, 51, 51, 0.5);
  }
`;

const MainTextBody = styled(Body)`
  overflow-x: clip;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
