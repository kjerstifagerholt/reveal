import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Icon } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import {
  filesUploadState,
  formState,
  isValid,
  suiteState,
} from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { ModalFooter } from 'components/modals/elements';
import { modalClose } from 'store/modals/actions';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useFormState } from 'hooks';
import { saveForm } from 'store/forms/thunks';
import { useMetrics } from 'utils/metrics';
import { BoardForm, SuiteForm } from './steps';
import Modal from '../simpleModal/Modal';
import { ModalContainer } from '../elements';
import { ModalConfig } from '../config';

type Step = 'suite' | 'boards';

interface Props {
  modalSettings: ModalConfig;
}

export const MultiStepModal: React.FC<Props> = ({ modalSettings }: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [step, setStep] = useState<Step>('suite');
  const history = useHistory();
  const suite = useSelector(suiteState);
  const hasErrors = !useSelector(isValid) || isEmpty(suite.title);
  const { clearForm } = useFormState();
  const { saving: formSaving } = useSelector(formState);
  const { deleteQueue } = useSelector(filesUploadState);
  const [filesUploadQueue] = useState(new Map());
  const metrics = useMetrics('EditSuite');

  const trackMetrics = (name: string, props?: any) => {
    metrics.track(name, { ...props, component: 'MultiStepModal' });
  };

  const nextStep = () => {
    if (hasErrors) return;
    trackMetrics('Select_EditBoards');
    setStep('boards');
  };

  const handleCloseModal = () => {
    dispatch(modalClose());
    clearForm();
    filesUploadQueue.clear();
  };

  const handleSubmit = async () => {
    if (hasErrors) return;

    await dispatch(
      saveForm(client, apiClient, suite, filesUploadQueue, deleteQueue)
    );
    trackMetrics('Saved', {
      suiteKey: suite.key,
      suite: suite.title,
    });
    handleCloseModal();
    history.push(`/suites/${suite.key}`);
  };

  const cancel = () => {
    trackMetrics('Cancel');
    handleCloseModal();
  };

  const Footer = () => (
    <ModalFooter>
      <Button variant="ghost" onClick={cancel} disabled={formSaving}>
        Cancel
      </Button>
      <div>
        {isEqual(step, 'suite') && (
          <Button
            type="primary"
            onClick={nextStep}
            disabled={hasErrors || formSaving}
          >
            {modalSettings.buttons[step].goToBoards}
          </Button>
        )}
        {formSaving ? (
          <Icon type="Loading" />
        ) : (
          <Button
            type="secondary"
            onClick={handleSubmit}
            disabled={hasErrors || formSaving}
          >
            {modalSettings.buttons.save}
          </Button>
        )}
      </div>
    </ModalFooter>
  );
  return (
    <Modal
      visible
      onCancel={cancel}
      headerText={modalSettings.header[step]}
      width={modalSettings.width[step]}
      footer={<Footer />}
    >
      <ModalContainer>
        {isEqual(step, 'suite') && <SuiteForm />}
        {isEqual(step, 'boards') && (
          <BoardForm filesUploadQueue={filesUploadQueue} />
        )}
      </ModalContainer>
    </Modal>
  );
};
