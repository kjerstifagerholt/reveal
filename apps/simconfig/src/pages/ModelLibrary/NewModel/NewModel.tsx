import { useNavigate } from 'react-location';

import styled from 'styled-components/macro';

import { ModelForm } from 'components/forms/ModelForm';
import { createCdfLink } from 'utils/createCdfLink';

export function NewModel() {
  const navigate = useNavigate();

  return (
    <NewModelContainer>
      <h2>Configure new model</h2>
      <ModelForm
        onUpload={({ modelName, simulator }) => {
          navigate({
            to: createCdfLink(
              `/model-library/models/${encodeURIComponent(
                simulator
              )}/${encodeURIComponent(modelName)}`
            ),
            replace: true,
          });
        }}
      />
    </NewModelContainer>
  );
}

const NewModelContainer = styled.div`
  margin: 24px;
`;
