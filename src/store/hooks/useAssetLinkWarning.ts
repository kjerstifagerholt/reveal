import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { unwrapResult } from '@reduxjs/toolkit';

export enum AssetWarnTypes {
  NoWarning,
  ApprovedAnnotationAssetNotLinkedToFile,
  RejectedAnnotationAssetLinkedToFile,
}

const useAssetLinkWarning = (
  annotation: AnnotationTableItem,
  file: FileInfo,
  allAnnotations: AnnotationTableItem[]
): AssetWarnTypes => {
  const [assetWarnType, setAssetWarnType] = useState<AssetWarnTypes>(
    AssetWarnTypes.NoWarning
  );
  const [asset, setAsset] = useState<VisionAsset | null>(null);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const fetchAndSetAsset = async (ann: AnnotationTableItem) => {
      const assetPayload = [];
      if (ann.linkedResourceId) {
        assetPayload.push({ id: ann.linkedResourceId });
      } else if (ann.linkedResourceExternalId) {
        assetPayload.push({
          externalId: ann.linkedResourceExternalId,
        });
      }
      const assetResponse = await dispatch(fetchAssets(assetPayload));
      const assets = unwrapResult(assetResponse);
      if (assets && assets.length) {
        setAsset(assets[0]);
      }
    };

    if (annotation.linkedResourceId || annotation.linkedResourceExternalId) {
      fetchAndSetAsset(annotation);
    } else {
      setAsset(null);
    }
  }, [annotation.linkedResourceId, annotation.linkedResourceExternalId]);

  useEffect(() => {
    if (asset) {
      if (
        annotation.status === AnnotationStatus.Verified &&
        !file.assetIds?.includes(asset.id)
      ) {
        setAssetWarnType(AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile);
      } else if (
        annotation.status === AnnotationStatus.Rejected &&
        file.assetIds?.includes(asset.id) &&
        allAnnotations
          .filter(
            (ann) =>
              ann.id !== annotation.id &&
              ann.status === AnnotationStatus.Verified
          ) // select other annotations except this one
          .every((tagAnnotation) => !isLinkedToAsset(tagAnnotation, asset)) // every other tag annotation is not approved and linked to the same asset
      ) {
        setAssetWarnType(AssetWarnTypes.RejectedAnnotationAssetLinkedToFile);
      } else {
        setAssetWarnType(AssetWarnTypes.NoWarning);
      }
    } else {
      setAssetWarnType(AssetWarnTypes.NoWarning);
    }
  }, [annotation, file, asset]);

  return assetWarnType;
};

export default useAssetLinkWarning;

const isLinkedToAsset = (
  ann: AnnotationTableItem,
  asset: VisionAsset
): boolean => {
  if (ann.linkedResourceId) {
    return ann.linkedResourceId === asset.id;
  }
  if (ann.linkedResourceExternalId) {
    return ann.linkedResourceExternalId === asset.externalId;
  }
  return false;
};
