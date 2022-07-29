import styled from 'styled-components';
import { HeaderContainer } from 'components/HeaderContainer';
import { Layout } from 'components/Layout';
import { useTranslation } from 'common';
import { Breadcrumb } from '@cognite/cdf-utilities';
import { useParams } from 'react-router-dom';
import { Body, Colors, Flex, Icon, Title } from '@cognite/cogs.js';
import { extractorsListExtended } from 'utils/extractorsListExtended';
import { Skeleton } from 'antd';

type DetailsHeaderProps = {
  isFetched: boolean;
  title: string;
  version: string;
  createdAt: string;
};

const DetailsHeader = ({
  isFetched,
  title,
  version,
  createdAt,
}: DetailsHeaderProps) => {
  const { t } = useTranslation();
  const { subAppPath, extractorExternalId } = useParams<{
    subAppPath?: string;
    extractorExternalId?: string;
  }>();
  return (
    <HeaderContainer>
      <Layout.Container>
        <Flex gap={36} direction="column">
          {isFetched ? (
            <>
              <Breadcrumb
                items={[
                  {
                    path: `/${subAppPath}`,
                    title: t('extract-data'),
                  },
                  {
                    path: `/${subAppPath}/${extractorExternalId}`,
                    title: title,
                  },
                ]}
              />
              <Flex direction="column" gap={16}>
                <div>
                  <img
                    src={
                      extractorsListExtended?.[extractorExternalId!]?.imagePath
                    }
                  />
                </div>
                <Title level="3">{title}</Title>
                <Flex gap={24}>
                  <Flex gap={6} alignItems="center">
                    <StyledIconMuted type="Layers" />
                    <StyledBodyMuted>
                      {t('version-semver', {
                        semver: version,
                      })}
                    </StyledBodyMuted>
                  </Flex>
                  <Flex gap={6} alignItems="center">
                    <StyledIconMuted type="Events" />
                    <StyledBodyMuted>
                      {t('released-date', {
                        createdAt,
                      })}
                    </StyledBodyMuted>
                  </Flex>
                </Flex>
              </Flex>
            </>
          ) : (
            <Skeleton />
          )}
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

export default DetailsHeader;

const StyledBodyMuted = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted']};
`;

const StyledIconMuted = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;
