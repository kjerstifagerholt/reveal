import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import includes from 'lodash/includes';
import { downloadFileFromUrl } from 'services/documentPreview/utils';
import { openExternalPage } from 'utils/openExternalPage';

import { Button, Tooltip } from '@cognite/cogs.js';
import { getTenantInfo } from '@cognite/react-container';

import { ADD_TO_FAVOURITES } from 'components/AddToFavoriteSetMenu/constants';
import {
  DownloadButton,
  PreviewButton,
  ViewButton,
  CogniteButton,
  FeedbackButton,
} from 'components/Buttons';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentConfig } from 'modules/documentSearch/hooks';
import { useExtractParentFolder } from 'modules/documentSearch/hooks/useExtractParentFolder';
import { useFavoriteDocumentIds } from 'modules/documentSearch/hooks/useFavoriteDocumentIds';
import { DocumentType } from 'modules/documentSearch/types';
import {
  canContextualize,
  getContextualizePath,
} from 'modules/documentSearch/utils/contextualize';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { FavoriteDropdown } from 'pages/authorized/search/common/FavoriteDropdown';
import { FlexGrow, FlexAlignItems } from 'styles/layout';

import { ActionContainer, FavouriteTooltip } from './elements';

interface Props {
  doc: DocumentType;
  handlePreviewClick?: () => void;
  handleViewClick?: () => void;
  isPreviewButtonDisabled?: boolean;
}

const DocumentPreviewActionsComponent: React.FC<Props> = ({
  doc,
  handlePreviewClick,
  handleViewClick,
  isPreviewButtonDisabled,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Search');
  const { data: config } = useDocumentConfig();
  const metrics = useGlobalMetrics('feedback');
  const [project] = getTenantInfo();
  const filteredLabels = useDocumentLabelsByExternalIds(doc.doc.labels);
  const extractParentFolder = useExtractParentFolder();
  const favoriteDocumentIds = useFavoriteDocumentIds();

  const onExtractParentFolder = () => {
    metrics.track('click-extract-parent-folder-button');
    extractParentFolder(doc);
  };

  const isFavored: boolean = useMemo(() => {
    return favoriteDocumentIds.includes(Number(doc.id));
  }, [doc.id, favoriteDocumentIds]);

  const onOpenFeedback = () => {
    dispatch(setObjectFeedbackModalDocumentId(doc.id));
    metrics.track('click-document-feedback-button');
  };

  const getDownloadUrlFromDoc = async () => {
    downloadFileFromUrl(doc.id);
  };

  const contextualize = () => canContextualize(filteredLabels);

  const goToSchematic = () => {
    openExternalPage(getContextualizePath(doc.doc.id, project));
  };

  const supportedFileTypes = config?.wellboreSchematics?.supportedFileTypes;

  /**
   * Does document type supported for Wellbore Schematics
   */
  const isSupportedFileType =
    supportedFileTypes &&
    includes(supportedFileTypes, doc.doc.fileCategory.toUpperCase());

  return (
    <ActionContainer>
      <FavouriteTooltip
        content={t(ADD_TO_FAVOURITES) as string}
        placement="top"
      >
        <FavoriteDropdown isFavored={isFavored} documentId={doc.doc.id} />
      </FavouriteTooltip>

      <Tooltip content={t('Explore Parent Folder') as string} placement="top">
        <Button
          type="ghost"
          data-testid="button-extract-parent-folder"
          onClick={onExtractParentFolder}
          icon="Folder"
          aria-label="Explore Parent Folder"
        />
      </Tooltip>
      <FeedbackButton onClick={onOpenFeedback} data-testid="button-feedback" />
      <DownloadButton
        tooltip={t('Download Document')}
        onClick={getDownloadUrlFromDoc}
        data-testid="button-download"
        aria-label="Download Document"
      />
      {contextualize() && isSupportedFileType && (
        <CogniteButton
          tooltip={t('Go to Wellbore Schematic')}
          aria-label={t('Go to Wellbore Schematic')}
          onClick={goToSchematic}
          data-testid="button-Schematic"
        />
      )}

      <FlexGrow />

      <FlexAlignItems>
        <PreviewButton
          data-testid="button-preview-document"
          disabled={isPreviewButtonDisabled}
          onClick={handlePreviewClick}
        />
        <ViewButton
          iconPlacement="left"
          data-testid="button-view-document"
          disabled={isPreviewButtonDisabled}
          onClick={handleViewClick}
        />
      </FlexAlignItems>
    </ActionContainer>
  );
};

export const DocumentPreviewActions = React.memo(
  DocumentPreviewActionsComponent
);
