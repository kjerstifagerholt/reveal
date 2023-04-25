import { Colors } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import ReactModal, { OnAfterOpenCallbackOptions } from 'react-modal';
import styled from 'styled-components';
import { ModalFooterProps } from './ModalFooter';

const StyledReactModal = styled((props) => (
  <ReactModal {...props}>{props.children}</ReactModal>
))`
  padding: 1.5rem;
  border-radius: 0.5rem;
  .cogs-modal-content {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  .cogs-modal-footer {
    justify-content: normal;
  }
  input,
  textarea {
    &.cogs-input {
      &.has-error {
        border-color: ${Colors['text-icon--status-critical']};
      }
    }
  }
`;

interface OwnProps extends ModalFooterProps {
  contentLabel?: string;
  visible: boolean;
  appElement: HTMLElement | {};
  afterOpenModal?: (obj?: OnAfterOpenCallbackOptions) => void;
  width?: number;
}

type Props = OwnProps;
const Modal: FunctionComponent<Props> = ({
  contentLabel,
  visible,
  afterOpenModal,
  width = 420,
  children,
  onCancel,
  appElement,
}: PropsWithChildren<Props>) => {
  return (
    <StyledReactModal
      isOpen={!!visible}
      onAfterOpen={afterOpenModal}
      onRequestClose={onCancel}
      contentLabel={contentLabel}
      style={{ content: { width } }}
      appElement={appElement}
      portalClassName={`ReactModalPortal ${
        (appElement as HTMLElement)
          ? (appElement as HTMLElement).classList[0]
          : ''
      }`}
      overlayClassName="ReactModal__Overlay cogs-modal-overlay"
      className="ReactModal__Content cogs-modal"
    >
      {children}
    </StyledReactModal>
  );
};

export default Modal;
