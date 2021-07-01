import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { Body, Select } from '@cognite/cogs.js';
import { changeOptions, useWorkflowItems } from 'modules/workflows';
import { getAllPossibleStringFields } from 'helpers';
import { OptionWrapper } from 'pages/Options/components';

type ResourceType = 'assets' | 'files';
type OptionsType = {
  label: number | string;
  value: number | string;
};

const defaultField: OptionsType = {
  label: 'name',
  value: 'name',
};

export const OptionFieldsToMatch = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { resources } = useWorkflowItems(workflowId, true);
  const { matchFields } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );

  const fields: { assets: OptionsType[]; files: OptionsType[] } = {
    assets: [
      ...getAllPossibleStringFields(resources?.assets ?? []).map(
        (resource) => ({
          label: resource,
          value: resource,
        })
      ),
    ],
    files: [
      ...getAllPossibleStringFields(resources?.files ?? []).map((resource) => ({
        label: resource,
        value: resource,
      })),
    ],
  };

  const getField = (resourceType: ResourceType) => {
    return (
      fields[resourceType].find(
        (field: OptionsType) =>
          matchFields[resourceType] === String(field.value)
      ) ?? defaultField
    );
  };

  const onFieldChange = (field: OptionsType, resourceType: ResourceType) => {
    const newFieldsToMatch = {
      ...matchFields,
      [resourceType]: field?.value ?? defaultField.value,
    };
    dispatch(changeOptions({ matchFields: newFieldsToMatch }));
  };

  return (
    <OptionWrapper>
      <Body level={2} strong>
        Select fields to match to scanned results
      </Body>
      {resources.files && (
        <Select
          title="Files:"
          value={getField('files')}
          onChange={(field: OptionsType) => onFieldChange(field, 'files')}
          options={fields.files}
          menuPlacement="top"
          styles={{
            container: (base: React.CSSProperties) => ({
              ...base,
              maxWidth: '240px',
              marginTop: '17px',
            }),
          }}
        />
      )}
      {resources.assets && (
        <Select
          title="Assets:"
          value={getField('assets')}
          onChange={(field: OptionsType) => onFieldChange(field, 'assets')}
          options={fields.assets}
          menuPlacement="top"
          styles={{
            container: (base: React.CSSProperties) => ({
              ...base,
              maxWidth: '240px',
              marginTop: '12px',
            }),
          }}
        />
      )}
    </OptionWrapper>
  );
};
