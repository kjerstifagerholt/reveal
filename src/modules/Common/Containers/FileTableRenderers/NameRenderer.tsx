import { CellRenderer } from 'src/modules/Common/Types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectUpdatedFileDetails } from 'src/modules/FileMetaData/fileMetadataSlice';
import { Tooltip } from '@cognite/cogs.js';
import exifIcon from 'src/assets/exifIcon.svg';
import React from 'react';
import styled from 'styled-components';

export const FileNameText = styled.div`
  display: flex;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 1 auto;
  display: inline-block;
`;

export const FileRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: inherit;
  width: inherit;
  align-items: center;
`;

export const ExifIcon = styled.div`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0px;
  padding-left: 0px;
  flex: 0 0 auto;
`;

export function NameRenderer({ rowData: { name, id } }: CellRenderer) {
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(id))
  );
  return (
    <FileRow>
      <FileNameText>{name}</FileNameText>
      {fileDetails?.geoLocation && (
        <Tooltip content="EXIF data added">
          <ExifIcon>
            <img src={exifIcon} alt="exifIcon" />
          </ExifIcon>
        </Tooltip>
      )}
    </FileRow>
  );
}
