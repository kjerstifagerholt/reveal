import React, { useContext } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { isErrorListEmpty } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite, Board } from 'store/suites/types';
import { modalClose } from 'store/modals/actions';
import { Button } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { BoardForm } from 'components/modals/multiStepModal/steps';
import { modalSettings } from 'components/modals/config';
import { ModalFooter, ModalContainer } from 'components/modals/elements';
import { useFormState } from 'hooks';

interface Props {
  dataItem: Suite;
}

const AddBoardModal: React.FC<Props> = ({ dataItem }: Props) => {
  const { suite, setSuite, board, setBoard } = useFormState(
    {} as Board,
    dataItem
  );
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const hasErrors = !useSelector(isErrorListEmpty);

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    if (hasErrors) return;
    handleCloseModal();
    await dispatch(insertSuite(client, apiClient, suite));
  };

  const footer = (
    <ModalFooter>
      <Button variant="ghost" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button type="primary" onClick={handleSubmit}>
        {modalSettings.edit.buttons.save}
      </Button>
    </ModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleCloseModal}
        headerText="Add board to suite"
        footer={footer}
        width={modalSettings.create.width.boards}
      >
        <ModalContainer>
          <BoardForm
            board={board}
            suite={suite}
            setSuite={setSuite}
            setBoard={setBoard}
          />
        </ModalContainer>
      </Modal>
    </>
  );
};

export default AddBoardModal;
