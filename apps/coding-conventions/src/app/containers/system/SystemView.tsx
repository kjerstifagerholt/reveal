import { Body, Flex, Infobar, Input, Select, Textarea } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { InfoTooltip } from '../../components/Info/InfoTooltip';
import { Modal } from '../../components/Modal/Modal';

import { useSystemMutate } from '../../service/hooks/mutate/useSystemMutate';
import { Resource } from '../../types';
import { SystemList } from './SystemList';

export const SystemView = () => {
  const { mutate } = useSystemMutate();

  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prevState) => !prevState);

  const handleCreateClick = async (
    title: string,
    resource: Resource,
    description: string | undefined,
    structure: string
  ) => {
    mutate({ title, resource, description, structure });
  };

  return (
    <>
      <SystemList onCreateClick={() => toggleVisibility()} />

      {visible && (
        <CreateModal
          toggleVisibility={toggleVisibility}
          onCreateClick={handleCreateClick}
        />
      )}
    </>
  );
};

interface Props {
  toggleVisibility: () => void;
  onCreateClick: (
    title: string,
    resource: Resource,
    description: string | undefined,
    structured: string
  ) => void;
}
const CreateModal: React.FC<Props> = ({ toggleVisibility }) => {
  const [title, setTitle] = useState('');
  const [resource, setResource] = useState<{
    label: string;
    value: Resource | undefined;
  }>({
    label: '',
    value: undefined,
  });
  const [description, setDescription] = useState('');
  const [structure, setStructure] = useState('');

  return (
    <Modal
      visible
      modalWidth="450px"
      modalHeight="490px"
      onCancel={toggleVisibility}
      title="Creating coding system"
      // footer={<ModalFooter onCancel={toggleVisibility} onOk={handleOkClick} />}
    >
      <Flex gap={8} direction="column">
        <Subtitle>Title *</Subtitle>
        <SearchInput
          fullWidth
          placeholder="File name"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Subtitle>
          Resource type *
          <InfoTooltip content="The resource type the tests should run on" />
        </Subtitle>
        <Select<Resource>
          value={resource}
          onChange={setResource}
          options={useMemo(
            () => [
              { label: 'Assets', value: 'assets' },
              { label: 'Files', value: 'files' },
            ],
            []
          )}
        />

        <Subtitle>Specify the coding structure *</Subtitle>
        <SearchInput
          fullWidth
          placeholder="ZZZZZZ NN-NN-NN NNN"
          required
          value={structure}
          onChange={(e) => setStructure(e.target.value)}
        />
        <Infobar type="danger">
          <strong>NB!</strong> The structure cannot be changed after creation
        </Infobar>

        <Subtitle>Description</Subtitle>
        <Textarea
          label="This is the label"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Flex>
    </Modal>
  );
};

const SearchInput = styled(Input)`
  border: 2px solid rgba(83, 88, 127, 0.16) !important;
`;

const Subtitle = styled(Body).attrs({ level: 3 })`
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
