import React from 'react';

import styled from 'styled-components';

import { Flex, Title } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../common';
import { useExtractorsList } from '../../hooks/useExtractorsList';
import { SourceSystem, useSourceSystems } from '../../hooks/useSourceSystems';
import { ExtractorWithReleases } from '../../service/extractors';

import CategorySidebarItem from './CategorySidebarItem';

type CategorySidebarProps = {
  extractorsList: ExtractorWithReleases[];
  hostedExtractorsList: ExtractorWithReleases[];
  sourceSystems: SourceSystem[];
};

const CategorySidebar = ({
  extractorsList,
  hostedExtractorsList,
  sourceSystems,
}: CategorySidebarProps): JSX.Element => {
  const { t } = useTranslation();

  const { isInitialLoading: isInitialLoadingExtractorsList } =
    useExtractorsList();
  const { isInitialLoading: isInitialLoadingSourceSystems } =
    useSourceSystems();

  const extractorCount = extractorsList?.length;
  const hostedExtractorCount = hostedExtractorsList?.length;
  const sourceSystemCount = sourceSystems?.length;

  const isLoading =
    isInitialLoadingExtractorsList || isInitialLoadingSourceSystems;
  const totalCount = extractorCount + sourceSystemCount + hostedExtractorCount;

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  return (
    <StyledContainer>
      <Title level={6}>{t('categories')}</Title>
      <Flex gap={4} direction="column">
        <CategorySidebarItem
          count={totalCount}
          isLoading={isLoading}
          title={t('all')}
        />
        <CategorySidebarItem
          category="extractor"
          count={extractorCount}
          isLoading={isInitialLoadingExtractorsList}
          title={t('extractor_other')}
        />
        {shouldShowHostedExtractors && (
          <CategorySidebarItem
            category="hosted-extractor"
            count={hostedExtractorCount}
            isLoading={isInitialLoadingExtractorsList}
            title={t('hosted-extractor_other')}
          />
        )}
        <CategorySidebarItem
          category="source-system"
          count={sourceSystemCount}
          isLoading={isInitialLoadingSourceSystems}
          title={t('source-system_other')}
        />
      </Flex>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 270px;
  width: 270px;
`;

export default CategorySidebar;
