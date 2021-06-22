export const CDF_LABEL: Readonly<string> = 'Cognite Data Fusion';
export const EXTRACTION_PIPELINE: Readonly<string> = 'Extraction pipeline';
export const EXTRACTION_PIPELINE_LOWER: Readonly<string> =
  'extraction pipeline';
export const EXTRACTION_PIPELINES: Readonly<string> = 'Extraction pipelines';
export const EXTRACTION_PIPELINES_LIST: Readonly<string> = `${EXTRACTION_PIPELINES} list`;
export const EMAIL_NOTIFICATION_TOOLTIP: Readonly<string> = `If checked, the person will receive e-mail notification when an ${EXTRACTION_PIPELINE.toLowerCase()} run fails. To edit, please click Edit button.`;

export const CONTACTS_DESCRIPTION: Readonly<string> = `Document contacts related to the ${EXTRACTION_PIPELINES.toLowerCase()}. This will help getting in touch with the right people on troubleshooting`;
export const NAME_LABEL: Readonly<string> = 'Name';
export const NAME_PLACEHOLDER: Readonly<string> = 'Enter name';
export const ROLE_LABEL: Readonly<string> = 'Role';
export const ROLE_PLACEHOLDER: Readonly<string> = 'Enter role';
export const EMAIL_LABEL: Readonly<string> = 'E-mail';
export const EMAIL_PLACEHOLDER: Readonly<string> = 'Enter email address';
export const NOTIFICATION_LABEL: Readonly<string> = 'Notification subscription';
export const NOTIFICATION_HINT: Readonly<string> = `When turned on, the contact will receive an email if the ${EXTRACTION_PIPELINE.toLowerCase()} fails`;

export const CONTACT_NAME_TEST_ID: Readonly<string> = 'contacts-name-';
export const CONTACT_EMAIL_TEST_ID: Readonly<string> = 'contacts-email-';
export const CONTACT_ROLE_TEST_ID: Readonly<string> = 'contacts-role-';
export const CONTACT_NOTIFICATION_TEST_ID: Readonly<string> =
  'contacts-sendNotification-';
export const ADD_CONTACT_TEST_ID: Readonly<string> = 'add-contact-btn';

export const REMOVE: Readonly<string> = 'Remove';
export const CANCEL: Readonly<string> = 'Cancel';
export const CLOSE: Readonly<string> = 'Close';
export const EDIT: Readonly<string> = 'Edit';
export const SAVE: Readonly<string> = 'Save';
export const OK: Readonly<string> = 'OK';
export const BACK: Readonly<string> = 'Back';
export const NEXT: Readonly<string> = 'Next';
export const ADD_CONTACT: Readonly<string> = 'Add another contact';
export const ADD_OWNER: Readonly<string> = 'Add owner';
export const CONTACTS_HINT = `Contacts could be someone responsible for a relevant application or persons to contact if there is an issue with the ${EXTRACTION_PIPELINE.toLowerCase()}. Please mark if the contact should recieve a notification if there is an issue.`;
export const OWNER_HINT = `The owner of an ${EXTRACTION_PIPELINE.toLowerCase()} is the person responsible for the ${EXTRACTION_PIPELINE.toLowerCase()}`;
export const REGISTER: Readonly<string> = 'Register';
export const ADD_ROW: Readonly<string> = 'Add row';
export const REMOVE_ROW: Readonly<string> = 'Remove row';
export const REMOVE_CONTACT: Readonly<string> = 'Remove contact';
export const METADATA_DESCRIPTION_LABEL: Readonly<string> =
  'Metadata description';
export const METADATA_CONTENT_LABEL: Readonly<string> = 'Metadata content';
export const METADATA_DESC_HEADING: Readonly<string> = 'Description';
export const METADATA_CONTENT_HEADING: Readonly<string> = 'Content';

export const INTEGRATION_DATA_SET_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} data set`;
export const DATA_SET_TIP: Readonly<string> = `The data your ${EXTRACTION_PIPELINE_LOWER} sends to CDF can be linked to a data set.`;
export const NO_DATA_SET_ID_SET: Readonly<string> = 'No data set';
export const NO_DATA_SET_ID_SET_TOOLTIP: Readonly<string> =
  'No data set registered';
export const NO_META_DATA: Readonly<string> = 'No metadata registered';
export const INTEGRATION_DOCUMENTATION_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} documentation`;
export const DESCRIPTION_HINT: Readonly<string> =
  'For users of data a good description of data content and other relevant metrics connected to data will give value for them to know the data better. Please enter a description.';
export const DESCRIPTION_LABEL: Readonly<string> = 'Description (optional)';

export const INTEGRATION_SCHEDULE_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} schedule`;
export const NO_SCHEDULE: Readonly<string> = 'Not defined';

export const NO_CONTACTS_MSG: Readonly<string> = 'No contacts registered';
export const INTEGRATION_RAW_TABLE_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} Raw Tables`;
export const NO_RAW_TABLES_MESSAGE: Readonly<string> =
  'No raw tables registered';

export const SERVER_ERROR_TITLE: Readonly<string> =
  'Your changes have not been saved';
export const SERVER_ERROR_CONTENT: Readonly<string> =
  'Please try again later, or contact you system administrator.';

export const NOTIFICATION_DIALOG_TITLE: Readonly<string> =
  'One contact with email notification';
export const NOTIFICATION_DIALOG_CONTENT: Readonly<string> = `The ${EXTRACTION_PIPELINE.toLowerCase()} must have at least one contact with email notification activated. This is in case of failures with the ${EXTRACTION_PIPELINE.toLowerCase()}. If you would like to change contacts click edit to update.`;

export const REMOVE_DIALOG_TEXT_PART: Readonly<string> =
  'Are you sure you want to remove';

export const EXTRACTION_PIPELINE_OVERVIEW: Readonly<string> = `${EXTRACTION_PIPELINE} overview`;
export const EXT_PIPE_TAB_OVERVIEW: Readonly<string> = `${EXTRACTION_PIPELINE} overview`;
export const EXT_PIPE_TAB_RUN_HISTORY: Readonly<string> = `${EXTRACTION_PIPELINE} run history`;
export const CONTACTS: Readonly<string> = 'Contacts';

// name
export const NAME_HINT = `Enter a name for your ${EXTRACTION_PIPELINE.toLowerCase()} to be able to view and monitor this.`;
export const EXT_PIPE_NAME_HEADING: Readonly<string> = `${EXTRACTION_PIPELINE} name`;

// Data set
export const DATA_SET_ID_HINT: Readonly<string> =
  'Type in the name or id of your data set';
export const DATA_SETS_LABEL: Readonly<string> = 'Data sets';
// Documentation
export const DOCUMENTATION_HINT: Readonly<string> =
  'Please add any relevant documentation.';

// Source
export const SOURCE_HINT: Readonly<string> =
  '**** Source hint placeholder ****';
export const SOURCE_LABEL: Readonly<string> = 'Source';

export const INTEGRATION_EXTERNAL_ID_HEADING: Readonly<string> = 'External id';
export const EXTERNAL_ID_HINT: Readonly<string> = `The external id is the id used to refer to this ${EXTRACTION_PIPELINE_LOWER} externally. It must be unique. Follow company conventions.`;

// Page headings
export const ADD_EXTRACTION_PIPELINE: Readonly<string> = `Add ${EXTRACTION_PIPELINE.toLowerCase()}`;

// Tracking constants
export const ACTION: Readonly<string> = 'Action';
export const ACTION_COPY: Readonly<string> = 'Action.Copy'; // + copyType
export const ACTION_DOWNLOAD: Readonly<string> = 'Action.Download'; // + download name
export const ACTION_EDIT: Readonly<string> = 'Action.Edit'; // + field and value
export const ACTION_REGISTER: Readonly<string> = 'Action.Register';
export const FILTER: Readonly<string> = 'Filter'; // + field and value
export const OVERVIEW: Readonly<string> = 'Overview'; // + tenant
export const NAVIGATION: Readonly<string> = 'Navigation'; // + href
export const SEARCH: Readonly<string> = 'Search'; // + query
export const SINGLE_EXT_PIPE: Readonly<string> = `${EXTRACTION_PIPELINE}.Details`; // + id
export const SINGLE_EXT_PIPE_RUNS: Readonly<string> = `${EXTRACTION_PIPELINE}.Health`; // + id
export const SORT: Readonly<string> = 'Sort'; // + field

// error msg
export const ERROR_NOT_GET_EXT_PIPE: Readonly<string> = `Could not get ${EXTRACTION_PIPELINES}`;
export const ERROR_NO_ID: Readonly<string> = `No id. Select an ${EXTRACTION_PIPELINES}`;

export const BtnTestIds = {
  EDIT_BTN: 'edit-btn-',
  REMOVE_BTN: 'remove-btn-',
  CANCEL_BTN: 'cancel-btn-',
  SAVE_BTN: 'save-btn-',
};
export const ContactBtnTestIds = {
  EDIT_BTN: 'edit-contact-btn-',
  REMOVE_BTN: 'remove-contact-btn-',
  CANCEL_BTN: 'cancel-contact-btn-',
  SAVE_BTN: 'save-contact-btn-',
};
