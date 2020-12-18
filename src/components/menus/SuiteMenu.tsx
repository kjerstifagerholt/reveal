/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { TS_FIX_ME } from 'types/core';
import { ActionsContainer, MenuContainer } from './elements';

interface Props {
  dataItem: TS_FIX_ME;
}
export const SuiteMenu: React.FC<Props> = ({ dataItem }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    modalProps: any
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    dispatch(modalOpen({ modalType, modalProps }));
  };

  return (
    <MenuContainer ref={ref}>
      <Button
        variant="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        onClick={handleMenuOpen}
      />
      <ActionsContainer>
        {isComponentVisible && (
          <Menu>
            <Menu.Item>Unpin</Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'EditSuite', { dataItem })
                }
              >
                Edit suite
              </div>
            </Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'DeleteSuite', { dataItem })
                }
              >
                Delete suite
              </div>
            </Menu.Item>
            <Menu.Item>Share suite</Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};
