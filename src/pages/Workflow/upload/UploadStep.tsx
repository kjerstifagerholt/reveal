import { FileUploader } from 'src/components/FileUploader';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { Detail, Title } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { addUploadedFile, selectAllFiles } from 'src/store/uploadedFilesSlice';
import { PopulateAnnotations } from 'src/store/thunks/PopulateAnnotations';
import { fetchFilesById } from 'src/store/thunks/fetchFilesById';

const FileUploaderWrapper = styled.div`
  margin: ${margin.default} 0;
`;

export default function UploadStep() {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
      dispatch(
        PopulateAnnotations({
          fileId: file.id.toString(),
          assetIds: file.assetIds,
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <Title level={2}>Upload file</Title>

      <FileUploaderWrapper>
        <FileUploader
          initialUploadedFiles={uploadedFiles}
          accept={['.jpeg', '.jpg', '.png', '.tiff', '.mp4'].join(', ')}
          maxTotalSizeInBytes={1 * 1024 ** 3 /* 1 GB */}
          maxFileCount={30}
          onUploadSuccess={onUploadSuccess}
        >
          <AcceptMessage>
            <b>* Supported files: </b>
            jpeg, png, tiff, mp4. Limit: 30 files with a total size of 1 GB.
          </AcceptMessage>
        </FileUploader>
      </FileUploaderWrapper>
    </>
  );
}

const AcceptMessage = styled(Detail)`
  text-align: right;
  color: #8c8c8c;
  opacity: 0.8;
  align-self: flex-end;
  width: 100%;
`;
