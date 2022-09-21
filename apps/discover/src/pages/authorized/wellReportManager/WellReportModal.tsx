import { useCreateReport } from 'domain/reportManager/internal/actions/useCreateReport';
import {
  DATA_SETS_MAP,
  REPORT_FEEDBACK_REASONS,
} from 'domain/reportManager/internal/constants';
import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import { useDispatch } from 'react-redux';

import map from 'lodash/map';

import { wellInspectActions } from 'modules/wellInspect/actions';
import { useWellFeedback } from 'modules/wellInspect/selectors';

import { CreateReportModal, ReportFormValues } from '../report-manager';

const dataSetFeedabckTypes = map(REPORT_FEEDBACK_REASONS, (label, value) => ({
  value,
  label,
}));

const dataSets = map(DATA_SETS_MAP, (label, value) => ({
  value,
  label,
}));

export const WellReportModal = () => {
  const wellFeedback = useWellFeedback();
  const dispatch = useDispatch();
  const { data: user } = useUserInfoQuery();
  const createReport = useCreateReport();

  const onCancel = () => {
    dispatch(
      wellInspectActions.setWellFeedback({
        visible: false,
      })
    );
  };

  const handleCreateReport = async ({
    description,
    dataSet,
    feedbackType,
  }: ReportFormValues) => {
    await createReport([
      {
        description,
        reason: feedbackType.value!,
        externalId: wellFeedback.wellboreMatchingId!,
        status: 'BACKLOG',
        reportType: dataSet.value!,
        startTime: Date.now(),
        ownerUserId: user!.id,
      },
    ]);
    dispatch(
      wellInspectActions.setWellFeedback({
        visible: false,
      })
    );
  };

  return (
    <CreateReportModal
      sourceTitle="Wellbore"
      sourceValue={wellFeedback.wellboreMatchingId!}
      feedbackTypeOptions={dataSetFeedabckTypes}
      dataSetOptions={dataSets}
      visible
      onCancel={onCancel}
      onCreateReport={handleCreateReport}
    />
  );
};
