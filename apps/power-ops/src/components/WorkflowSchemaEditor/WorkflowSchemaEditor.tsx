import { Button, Icon, Label, Tooltip } from '@cognite/cogs.js';
import Editor, { BeforeMount } from '@monaco-editor/react';
import { WorkflowSchemaEditable } from 'types';
import { editor } from 'monaco-editor';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import WorkflowJSONSchema from 'types/WorkflowSchemaEditable.schema.json';
import { CommonHeader } from 'components/CommonHeader/CommonHeader';

interface Props {
  initialValue: WorkflowSchemaEditable;
  onSave: (newValue: WorkflowSchemaEditable) => void;
  onHasUnsavedChanges?: (canSave: boolean) => void;
  onCancel?: (nextIndex: undefined, needSave: boolean) => void;
  height: ComponentProps<typeof Editor>['height'];
}

const validateCode = (code: any): code is string => {
  try {
    JSON.parse(code);
    return true;
  } catch (e) {
    return false;
  }
};

export const WorkflowSchemaEditor = ({
  initialValue,
  onSave,
  onHasUnsavedChanges,
  onCancel,
  height = 'calc(100vh - 61px - 61px)', // 61px is the Common Header used in both sides
}: Props) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const [valid, setValid] = useState(true);
  const [editedWorkflowSchema, setEditedWorkflowSchema] =
    useState(initialValue);

  const workflowSchemaChanged = useMemo(
    () => JSON.stringify(initialValue) !== JSON.stringify(editedWorkflowSchema),
    [editedWorkflowSchema]
  );
  const hasUnsavedChanges = valid && workflowSchemaChanged;

  const setupEditor: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://power-ops/schema.json',
          fileMatch: ['*'],
          schema: WorkflowJSONSchema,
        },
      ],
    });
    monaco.editor.defineTheme('powerOps', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#32385304',
        'editorGutter.background': '#3238530f',
        'editorLineNumber.foreground': '#000000',
        'editorLineNumber.activeForeground': '#000000',
      },
    });
  };

  useEffect(() => {
    onHasUnsavedChanges?.(hasUnsavedChanges);
    return () => onHasUnsavedChanges?.(false);
  }, [hasUnsavedChanges]);

  return (
    <div>
      <CommonHeader title={editedWorkflowSchema.name}>
        <Label variant={valid ? 'success' : 'danger'} style={{ margin: 0 }}>
          {valid ? 'Code valid' : 'Code invalid'}
        </Label>
      </CommonHeader>
      <Editor
        height={height}
        language="json"
        theme="powerOps"
        loading={<Icon type="Loader" />}
        value={JSON.stringify(editedWorkflowSchema, null, 2)}
        onMount={(editor) => {
          editorRef.current = editor;
          editor.getAction('editor.action.formatDocument').run();
        }}
        beforeMount={setupEditor}
        onChange={(code) => {
          if (!validateCode(code)) return;
          setEditedWorkflowSchema(JSON.parse(code));
        }}
        onValidate={(markers) => setValid(markers.length === 0)}
        options={{
          formatOnType: true,
          formatOnPaste: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          theme: 'powerOps',
          autoClosingBrackets: 'always',
          renderValidationDecorations: 'on',
          readOnly: false,
          overviewRulerLanes: 0,
          renderLineHighlight: 'none',
          folding: false,
        }}
      />
      <CommonHeader
        title=""
        style={{
          borderBottom: 0,
          borderTop: '1px solid var(--cogs-bg-control--disabled)',
        }}
      >
        {onCancel && (
          <Button
            title="Cancel"
            onClick={() => onCancel(undefined, hasUnsavedChanges)}
            aria-label="Cancel"
          >
            Cancel
          </Button>
        )}
        <Tooltip content="Workflow Schema is not valid" disabled={valid}>
          <Button
            disabled={!hasUnsavedChanges}
            type="primary"
            onClick={() => hasUnsavedChanges && onSave(editedWorkflowSchema)}
            aria-label="Save"
            style={{ marginLeft: 5 }}
          >
            Save
          </Button>
        </Tooltip>
      </CommonHeader>
    </div>
  );
};
