import React, { useCallback } from 'react';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import styled from 'styled-components';
import Highlighter from 'react-highlight-words';
import {
  HighlightCell,
  EllipsisText,
  FileThumbnail,
} from '@data-exploration-components/components';
import { Popover } from 'antd';
import { mapMimeTypeToDocumentType, isFilePreviewable } from '../../../utils';
import { DocumentIcon, Flex } from '@cognite/cogs.js';

const DocumentIconWrapper = styled.div`
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
`;
export const DocumentNamePreview = ({
  fileName,
  file,
  query,
}: {
  fileName: string;
  file: InternalDocument;
  query: string | undefined;
}) => {
  const isPreviewable = isFilePreviewable(file);
  const name = fileName || '';

  const getDocumentIcon = useCallback(() => {
    return (
      <DocumentIconWrapper>
        {file?.mimeType && (
          <DocumentIcon file={mapMimeTypeToDocumentType(file.mimeType)} />
        )}
      </DocumentIconWrapper>
    );
  }, [file.mimeType]);

  if (isPreviewable) {
    return (
      <Flex gap={4} alignItems="center">
        <Popover
          content={<FileThumbnail file={file} />}
          title={name}
          trigger="hover"
          placement="topLeft"
        >
          {getDocumentIcon()}
        </Popover>

        <EllipsisText level={2} lines={2}>
          <Highlighter
            searchWords={(query || '').split(' ')}
            textToHighlight={name}
            autoEscape
          />
        </EllipsisText>
      </Flex>
    );
  }

  return (
    <Flex gap={4} alignItems="center">
      {getDocumentIcon()}
      <EllipsisText level={2} lines={2}>
        <HighlightCell text={name} query={query} />
      </EllipsisText>
    </Flex>
  );
};
