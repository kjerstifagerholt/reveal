import { Button, Input, Switch, Select } from '@cognite/cogs.js';
import { Field, useFormikContext } from 'formik';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import {
  InputArea,
  InputAreaTitle,
  InputFullWidth,
  InputRow,
  SectionTitle,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';

import { AGGREGATE_TYPE, CHECK_TYPE } from './constants';
import { CalculationConfig } from './types';

export function DataSamplingSection() {
  const { values, setFieldValue } = useFormikContext<CalculationConfig>();
  return (
    <>
      <SectionTitle level={2}>Data Sampling</SectionTitle>

      <InputArea>
        <InputAreaTitle level={3}>Configuration</InputAreaTitle>
        <InputRow>
          <Field
            as={Input}
            title="Validation Window"
            name="dataSampling.validationWindow"
            disabled
            type="number"
            postfix={<Button disabled>Min</Button>}
          />
          <Field
            as={Input}
            title="Sampling Window"
            name="dataSampling.samplingWindow"
            disabled
            type="number"
            postfix={<Button disabled>Min</Button>}
          />
          <Field
            as={Input}
            title="Granularity"
            name="dataSampling.granularity"
            disabled
            postfix={<Button disabled>Min</Button>}
          />
        </InputRow>
      </InputArea>
      <InputArea>
        <InputAreaTitle level={3}>
          Logical check
          <Switch
            disabled
            value={values.logicalCheck.enabled}
            name="logicalCheck.enabled"
            onChange={(value: boolean) =>
              setFieldValue('logicalCheck.enabled', value)
            }
          />
        </InputAreaTitle>
        <InputRow>
          <Field
            as={InputFullWidth}
            title="Time series"
            name="logicalCheck.externalId"
            fullWidth
            disabled
          />
          <InputWithLabelContainer>
            <InputLabel>Sampling method</InputLabel>
            <Field
              as={Select}
              theme="grey"
              isDisabled
              closeMenuOnSelect
              value={{
                value: values.logicalCheck.aggregateType,
                label: AGGREGATE_TYPE[values.logicalCheck.aggregateType],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('logicalCheck.aggregateType', value);
              }}
              options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
              name="logicalCheck.aggregateType"
              fullWidth
              disabled
            />
          </InputWithLabelContainer>
          <InputWithLabelContainer>
            <InputLabel>Check</InputLabel>
            <Field
              as={Select}
              theme="grey"
              isDisabled
              closeMenuOnSelect
              value={{
                value: values.logicalCheck.check,
                label: CHECK_TYPE[values.logicalCheck.check],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('logicalCheck.check', value);
              }}
              options={getSelectEntriesFromMap(CHECK_TYPE)}
              name="logicalCheck.check"
              fullWidth
              disabled
            />
          </InputWithLabelContainer>

          <Field
            as={Input}
            title="Value"
            name="logicalCheck.value"
            type=""
            disabled
          />
        </InputRow>
      </InputArea>
      <InputArea>
        <InputAreaTitle level={3}>
          Steady state detection
          <Switch
            value={values.logicalCheck?.enabled}
            disabled
            name="steadyStateDetection.enabled"
            onChange={(value: boolean) =>
              setFieldValue('logicalCheck.enabled', value)
            }
          />
        </InputAreaTitle>
        <InputRow>
          <Field
            as={InputFullWidth}
            title="Time series"
            name="steadyStateDetection.externalId"
            disabled
            fullWidth
          />
          <InputWithLabelContainer>
            <InputLabel>Sampling method</InputLabel>
            <Field
              as={Select}
              theme="grey "
              isDisabled
              closeMenuOnSelect
              value={{
                value: values.steadyStateDetection.aggregateType,
                label:
                  AGGREGATE_TYPE[values.steadyStateDetection.aggregateType],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('steadyStateDetection.aggregateType', value);
              }}
              options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
              name="steadyStateDetection.aggregateType"
              fullWidth
              disabled
            />
          </InputWithLabelContainer>
          <Field
            as={Input}
            title="Min Section Size"
            name="steadyStateDetection.minSectionSize"
            type="number"
            disabled
          />
          <Field
            as={Input}
            title="Var threshold"
            name="steadyStateDetection.varThreshold"
            type="number"
            disabled
          />
          <Field
            as={Input}
            title="Slope threshold"
            name="steadyStateDetection.slopeThreshold"
            type="number"
            disabled
          />
        </InputRow>
      </InputArea>
    </>
  );
}
