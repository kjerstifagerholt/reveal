import React from 'react';
import InlineEdit from 'components/extpipe/InlineEdit';
import * as yup from 'yup';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { Schedule } from 'components/extpipe/edit/Schedule';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { FieldVerticalDisplay } from 'components/extpipe/fields/FieldVerticalDisplay';
import RawTablesSection from 'components/inputs/rawSelector/RawTablesSection';
import { Column, ContactsSection } from 'components/extpipe/ContactsSection';
import { MetaDataSection } from 'components/extpipe/MetaDataSection';
import { EditDataSetId } from 'components/extpipe/edit/EditDataSetId';
import { Section } from 'components/extpipe/Section';
import { NotificationSection } from 'components/extpipe/NotificationSection';
import {
  externalIdRule,
  metaDescriptionSchema,
  sourceSchema,
} from 'utils/validation/extpipeSchemas';
import { useTranslation } from 'common';
import { DetailFieldNames } from 'model/Extpipe';

interface Props {
  canEdit: boolean;
}

export const ExtpipeInformation = ({ canEdit }: Props) => {
  const { t } = useTranslation();
  const { data: extpipe } = useSelectedExtpipe();

  if (!extpipe) {
    return null;
  }

  return (
    <>
      <Section title="Basic information" icon="World">
        <InlineEdit
          name="description"
          hintText={'description-hint'}
          placeholder={t('description-placeholder')}
          label={t('description')}
          canEdit={canEdit}
          schema={metaDescriptionSchema}
          defaultValues={{ description: extpipe?.description }}
          fullWidth
          updateFn={rootUpdate({ extpipe, name: 'description' })}
          marginBottom
          showLabel
        />
        <EditDataSetId canEdit={canEdit} />
        <InlineEdit
          name="source"
          hintText={t('source-hint')}
          placeholder={t('source-placeholder')}
          label={t('source')}
          canEdit={canEdit}
          schema={sourceSchema}
          updateFn={rootUpdate({ extpipe, name: 'source' })}
          defaultValues={{
            source: extpipe?.source,
          }}
          fullWidth
          showLabel
          marginBottom
        />
        <InlineEdit
          name="externalId"
          hintText={t('external-id-hint')}
          placeholder={t('external-id-placeholder')}
          label={t('external-id')}
          canEdit={canEdit}
          schema={yup.object().shape(externalIdRule)}
          defaultValues={{ externalId: extpipe?.externalId }}
          fullWidth
          updateFn={rootUpdate({ extpipe, name: 'externalId' })}
          marginBottom
          showLabel
        />
        <Schedule
          name="schedule"
          extpipe={extpipe}
          label={t('schedule')}
          canEdit={canEdit}
        />
      </Section>
      <NotificationSection extpipe={extpipe} canEdit={canEdit} />
      <ContactsSection canEdit={canEdit} />
      <RawTablesSection canEdit={canEdit} />
      <MetaDataSection canEdit={canEdit} />
      <Section title={t('about-ext-pipeline')} icon="Info">
        <Column>
          <FieldVerticalDisplay
            label={t('ext-pipeline-id') as DetailFieldNames}
            fieldName="id"
            fieldValue={extpipe?.id}
          />
          <FieldVerticalDisplay
            label={t('created-by') as DetailFieldNames}
            fieldName="createdBy"
            fieldValue={extpipe?.createdBy}
          />
          <FieldVerticalDisplay
            label={t('created-time') as DetailFieldNames}
            fieldName="createdTime"
            fieldValue={extpipe?.createdTime}
          />
          <FieldVerticalDisplay
            label={t('last-updated-time') as DetailFieldNames}
            fieldName="lastUpdatedTime"
            fieldValue={extpipe?.lastUpdatedTime}
          />
        </Column>
      </Section>
    </>
  );
};
