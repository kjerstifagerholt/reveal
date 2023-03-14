import { useEffect, useState } from 'react';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { notification } from 'antd';
import PapaParse from 'papaparse';
import { v4 as uuid } from 'uuid';

import { useTranslation } from 'common/i18n';
import { PrimaryKeyMethod } from 'components/CreateTableModal/CreateTableModal';
import { sleep } from 'utils/utils';

import { RAWUploadStatus, renderUploadError, UseUploadOptions } from './upload';
import languageEncoding from 'detect-file-encoding-and-language';

export const useCSVUpload = ({
  file,
  selectedPrimaryKeyMethod,
  selectedColumnIndex,
}: UseUploadOptions) => {
  const { t } = useTranslation();
  const sdk = useSDK();

  const [[database, table], setTableToUpload] = useState<
    [string | undefined, string | undefined]
  >([undefined, undefined]);

  const [columns, setColumns] = useState<string[] | undefined>();
  const [parser, setParser] = useState<PapaParse.Parser | undefined>();
  const [parsedCursor, setParsedCursor] = useState(0);
  const [uploadedCursor, setUploadedCursor] = useState(0);
  const [fileEncoding, setFileEncoding] = useState('');

  const [uploadStatus, setUploadStatus] = useState<RAWUploadStatus>(undefined);

  const parsePercentage =
    !file || !uploadStatus || uploadStatus === 'ready'
      ? 0
      : Math.ceil((parsedCursor / file.size) * 100);

  const uploadPercentage =
    !file || !uploadStatus || uploadStatus === 'ready'
      ? 0
      : Math.ceil((uploadedCursor / file.size) * 100);

  const selectedColumn =
    selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
    selectedColumnIndex !== undefined
      ? columns?.[selectedColumnIndex]
      : undefined;

  useEffect(
    () => () => {
      if (!parser) return;
      parser.abort();
    },
    [parser]
  );

  useEffect(() => {
    if (!file) {
      return;
    }

    PapaParse.parse(file, {
      error: (e) => {
        notification.error({
          message: t('file-invalid-error', { name: file.name }),
          key: 'file-invalid',
          description: e?.message,
        });
      },
      step(result, _parser) {
        setColumns(result.data as string[]);
        setUploadStatus('ready');
        _parser.abort();
        // setFileEncoding();
        // console.log(file);
        // console.log(
        //   (result.data as string[]).find((value) => value.includes('�'))
        // );
        languageEncoding(file).then((fileInfo) =>
          setFileEncoding(fileInfo.encoding as string)
        );
      },
      complete: () => {},
    });
  }, [file, t]);

  useEffect(() => {
    if (!file || !database || !table) {
      return;
    }

    try {
      PapaParse.parse<any>(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        header: true,
        encoding: fileEncoding,
        error: (e) => {
          notification.error({
            message: t('file-upload-error', { name: file.name }),
            key: 'file-upload',
            description: e.message,
          });
          setUploadStatus('error');
        },
        complete: () => {},
        chunk(results, _parser) {
          setParser(_parser);
          _parser.pause();
          setParsedCursor(results.meta.cursor);
          let items: { key: string; columns: Record<string, any> }[] = [];
          try {
            items = results.data.map((rowData: Record<string, any>) => ({
              key: !selectedColumn
                ? uuid()
                : rowData[selectedColumn].toString(),
              columns: rowData,
            }));
          } catch (e) {
            notification.error({
              message: t('file-upload-primary-key-empty-cells'),
              key: 'file-upload',
            });
            setUploadStatus('error');
            throw e;
          }

          if (items.length) {
            console.log(fileEncoding);
            sdk.raw
              .insertRows(database, table, items)
              .then(() => {
                setUploadedCursor(results.meta.cursor);
              })
              // Keep the main thread "open" to render progress before continuing parsing the file
              .then(() => sleep(100))
              .then(() => _parser.resume())
              .catch((e: CogniteError) => {
                notification.error({
                  message: t('file-upload-network-error'),
                  description: renderUploadError(e),
                  key: 'file-upload',
                });
                setUploadStatus('error');
                throw e;
              });
          }
        },
      });
    } catch {}
  }, [file, columns, selectedColumn, database, table, sdk.raw, t]);

  useEffect(() => {
    if (uploadPercentage === 100) {
      setUploadStatus('success');
      notification.success({
        message: t('file-upload-success', { name: file?.name }),
        key: 'file-upload',
      });
    }
  }, [file, t, uploadPercentage]);

  const onConfirmUpload = (database: string, table: string) => {
    trackEvent('RAW.Explorer.CSVUpload.Upload');
    setTableToUpload([database, table]);
    setUploadStatus('in-progress');
  };

  return {
    parsePercentage,
    uploadPercentage,
    columns,
    onConfirmUpload,

    isUploadError: uploadStatus === 'error',
    isUploadInProgress: uploadStatus === 'in-progress',
    isUploadSuccess: uploadStatus === 'success',
    uploadStatus,
  };
};
