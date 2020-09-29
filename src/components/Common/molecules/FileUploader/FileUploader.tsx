import React, { useState } from 'react';
import { Upload, Modal, message } from 'antd';
import UploadGCS from '@cognite/gcs-browser-upload';
import { FileUploadResponse } from 'cognite-sdk-v3';
import { UploadFile } from 'antd/lib/upload/interface';
import { getMIMEType } from 'utils/FileUtils';
import { SpacedRow } from 'components/Common';
import { Body, Icon, Button } from '@cognite/cogs.js';
import { getSDK } from 'utils/SDK';

export const GCSUploader = (
  file: Blob | UploadFile,
  uploadUrl: string,
  callback: (info: any) => void = () => {}
) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'cognite-data-fusion-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};

const { Dragger } = Upload;
const { confirm } = Modal;

enum STATUS {
  WAITING,
  READY,
  STARTED,
  PAUSED,
}

type Props = {
  assetIds?: number[];
  validExtensions?: string[];
  onUploadSuccess?: (file: FileUploadResponse) => void;
  onFileListChange?: (fileList: UploadFile[]) => void;
  onUploadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeUploadStart?: () => void;
  children?: React.ReactNode;
};
const currentUploads: { [key: string]: any } = {};

export const FileUploader = ({
  children,
  assetIds,
  validExtensions,
  onUploadSuccess = () => {},
  onUploadFailure = alert,
  onCancel = () => {},
  beforeUploadStart = () => {},
  onFileListChange = () => {},
}: Props) => {
  const sdk = getSDK();
  const [uploadStatus, setUploadStatus] = useState<STATUS>(STATUS.WAITING);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const startUpload = async () => {
    if (uploadStatus !== STATUS.READY) {
      return;
    }

    try {
      beforeUploadStart();
    } catch (e) {
      onUploadFailure('Unable to start upload');
      return;
    }

    message.info('Starting Upload...');

    fileList.forEach(async file => {
      const mimeType = getMIMEType(file.name);

      const fileMetadata = (await sdk.files.upload({
        name: file.name,
        mimeType: mimeType || undefined,
        source: 'Cognite Data Fusion',
        ...(assetIds && { assetIds }),
      })) as FileUploadResponse;
      const { uploadUrl, id } = fileMetadata;

      if (!uploadUrl || !id) {
        onUploadFailure('Unable to create file');
        return;
      }

      file.status = 'uploading';
      file.percent = 0;

      setFileList(list =>
        list.map(el => {
          if (el.uid === file.uid) {
            return file;
          }
          return el;
        })
      );

      currentUploads[file.uid] = await GCSUploader(
        file,
        uploadUrl,
        (info: any) => {
          file.response = info;
          file.percent = (info.uploadedBytes / info.totalBytes) * 100;

          setFileList(list =>
            list.map(el => {
              if (el.uid === file.uid) {
                return file;
              }
              return el;
            })
          );
        }
      );

      setUploadStatus(STATUS.STARTED);

      try {
        await currentUploads[file.uid].start();
      } catch (e) {
        message.error('Unable to upload file to server.');
      }

      setFileList(list => list.filter(el => el.uid !== file.uid));
      if (fileList.length === 1) {
        setUploadStatus(STATUS.WAITING);
      }

      onUploadSuccess(fileMetadata);

      currentUploads[file.uid].meta.reset(); // clears the locally stored metadata
      setUploadStatus(STATUS.WAITING);
    });
  };

  const stopUpload = () => {
    fileList.forEach(file => {
      if (uploadStatus === STATUS.PAUSED || uploadStatus === STATUS.STARTED) {
        confirm({
          title: 'Do you want to cancel the file upload?',
          content: 'If you cancel, the file upload will be cancelled!',
          onOk: () => {
            currentUploads[file.uid].cancel();
            currentUploads[file.uid].meta.reset();
            setFileList([]);
            setUploadStatus(STATUS.WAITING);
          },
          onCancel: () => {
            onCancel();
          },
        });
      } else {
        if (currentUploads[file.uid]) {
          currentUploads[file.uid].cancel();
          currentUploads[file.uid].meta.reset();
        }
        onCancel();
        setFileList([]);
        setUploadStatus(STATUS.WAITING);
      }
    });
  };

  const pauseUpload = () => {
    if (uploadStatus === STATUS.STARTED) {
      fileList.forEach(file => {
        currentUploads[file.uid].pause();
      });
      setUploadStatus(STATUS.PAUSED);
    }
  };

  const unpauseUpload = () => {
    if (uploadStatus === STATUS.PAUSED) {
      fileList.forEach(file => {
        currentUploads[file.uid].unpause();
      });

      setUploadStatus(STATUS.STARTED);
    }
  };

  const removeFile = (file: UploadFile) => {
    setFileList(list => list.filter(el => el.uid !== file.uid));
    onFileListChange(fileList);
  };

  const setupFilesBeforeUpload = (file: any) => {
    if (
      validExtensions === undefined ||
      validExtensions.length === 0 ||
      validExtensions.includes(file.name.split('.').pop().toLowerCase())
    ) {
      setFileList(list => [...list, file]);
      setUploadStatus(STATUS.READY);
      onFileListChange(fileList);
    } else {
      setFileList([]);
      setUploadStatus(STATUS.WAITING);
      message.error(`${file.name} has an invalid extension`);
    }

    // false stops them from automatically using their upload functionaility
    return false;
  };

  const uploadButtons = () => {
    let uploaderButton;
    switch (uploadStatus) {
      case STATUS.WAITING:
        uploaderButton = (
          <>
            <div style={{ flex: 1 }} />
            <Button type="primary" icon="Upload" disabled>
              Upload
            </Button>
          </>
        );
        break;
      case STATUS.READY:
        uploaderButton = (
          <>
            <div style={{ flex: 1 }} />
            <Button type="primary" onClick={startUpload} icon="Upload">
              Upload
            </Button>
          </>
        );
        break;
      case STATUS.STARTED:
        uploaderButton = (
          <>
            <Button onClick={stopUpload}>Cancel Upload</Button>
            <div style={{ flex: 1 }} />
            <Button type="primary" onClick={pauseUpload} icon="Loading">
              Pause Upload
            </Button>
          </>
        );
        break;
      case STATUS.PAUSED:
        uploaderButton = (
          <>
            <Button onClick={stopUpload}>Cancel Upload</Button>
            <div style={{ flex: 1 }} />
            <Button type="primary" onClick={unpauseUpload}>
              Continue Upload
            </Button>
          </>
        );
        break;
      default:
        uploaderButton = null;
    }

    return (
      <SpacedRow style={{ marginTop: '12px' }}>{uploaderButton}</SpacedRow>
    );
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple
        onRemove={removeFile}
        beforeUpload={setupFilesBeforeUpload}
        fileList={fileList}
      >
        <Icon type="Upload" />
        <Body>
          Click or drag file to this area to upload, will begin upload when you
          click the Upload button.
        </Body>
      </Dragger>
      {children}
      {uploadButtons()}
    </div>
  );
};
