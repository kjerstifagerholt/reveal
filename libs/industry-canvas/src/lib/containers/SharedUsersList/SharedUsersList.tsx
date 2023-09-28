import styled from 'styled-components';

import { Avatar, Button, Body, AvatarProps } from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks/useTranslation';
import { UserProfile } from '../../UserProfileProvider';

type Props = {
  ownerProfile?: UserProfile;
  sharedUsers?: UserProfile[];
  onUserRemoved: (userId: string) => void;
  size?: AvatarProps['size']; // use 'small' here if needed (for 'Charts').
  enableUserRemoval?: boolean;
};

export const SharedUsersList = ({
  ownerProfile,
  sharedUsers,
  onUserRemoved,
  size,
  enableUserRemoval = true,
}: Props) => {
  const { t } = useTranslation();

  return (
    <SharedUsersListWrapper>
      {ownerProfile !== undefined && (
        <UserItemWrapper>
          <UserInfo>
            <Avatar size={size ?? 'medium'} text={ownerProfile.displayName} />
            <Body as="span" size={size ? 'small' : 'medium'}>
              {ownerProfile.displayName} (
              {t(translationKeys.CANVAS_OWNER_LABEL, 'Owner')})
            </Body>
          </UserInfo>
        </UserItemWrapper>
      )}
      {sharedUsers !== undefined &&
        sharedUsers.map((user) => {
          return (
            <UserItemWrapper key={`shared-user-${user.userIdentifier}`}>
              <UserInfo>
                <Avatar size={size ?? 'medium'} text={user.displayName} />
                <Body as="span" size={size ? 'small' : 'medium'}>
                  {user.displayName}
                </Body>
              </UserInfo>
              {enableUserRemoval && (
                <UserActions>
                  <Button
                    icon="Close"
                    type="ghost"
                    onClick={() => onUserRemoved(user.userIdentifier)}
                    size={size ? 'small' : 'medium'}
                  />
                </UserActions>
              )}
            </UserItemWrapper>
          );
        })}
    </SharedUsersListWrapper>
  );
};

const SharedUsersListWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const UserItemWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .cogs-avatar {
    margin-right: 10px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserActions = styled.div``;
