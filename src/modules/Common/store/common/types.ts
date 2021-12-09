import { Label, Metadata } from '@cognite/cdf-sdk-singleton';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';

export type BulkEditUnsavedState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
};

export type CommonState = {
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  bulkEditUnsavedState: BulkEditUnsavedState;
  saveState: {
    mode: CDFStatusModes;
    time?: number;
  };
};
