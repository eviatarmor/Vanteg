import type { WorkflowNodeType } from "./types"
import {
  fileContentField,
  fileOperationField,
  filePathField,
  notificationChannelField,
  notificationMessageField,
  notificationSeverityField,
  notificationTitleField,
  respondWebhookBodyField,
  respondWebhookHeadersField,
  respondWebhookStatusField,
} from "./notify-file-fields"
import {
  fileListOutputs,
  fileReadOutputs,
  fileWriteOutputs,
  notificationActionOutputs,
  respondWebhookOutputs,
  ACTION_EXECUTION,
} from "./io-contracts"

const credential: WorkflowNodeType["fields"][number] = {
  key: "credentialId",
  label: "Credential",
  placeholder: "None",
  control: "credential",
  section: "connection",
  mode: "fixed",
}

/** Platform Notification / File / Respond-to-webhook nodes with polished Setup fields. */
export const notifyFileNodes: WorkflowNodeType[] = [
  {
    id: "notification",
    label: "Notification",
    description: "Send a push or in-app notification.",
    kind: "action",
    category: "Actions",
    fields: [
      credential,
      notificationChannelField(),
      notificationTitleField(),
      notificationMessageField(),
      notificationSeverityField(),
    ],
    outputs: notificationActionOutputs,
    executionOptions: [...ACTION_EXECUTION],
  },
  {
    id: "file",
    label: "File",
    description: "Read, write, list, or delete a file.",
    kind: "action",
    category: "Actions",
    fields: [
      filePathField(),
      fileOperationField(),
      fileContentField(),
      {
        key: "encoding",
        label: "Encoding",
        placeholder: "utf-8",
        section: "options",
        mode: "fixed",
        showWhen: { key: "operation", equals: ["read", "write"] },
      },
      {
        key: "overwrite",
        label: "Overwrite",
        placeholder: "true",
        control: "boolean",
        section: "options",
        mode: "fixed",
        showWhen: { key: "operation", equals: "write" },
      },
      {
        key: "pattern",
        label: "Pattern",
        placeholder: "*.csv",
        section: "options",
        mode: "either",
        showWhen: { key: "operation", equals: "list" },
      },
      {
        key: "recursive",
        label: "Recursive",
        placeholder: "false",
        control: "boolean",
        section: "options",
        mode: "fixed",
        showWhen: { key: "operation", equals: "list" },
      },
      {
        key: "ifMissing",
        label: "If missing",
        placeholder: "error",
        control: "select",
        section: "options",
        mode: "fixed",
        showWhen: { key: "operation", equals: ["read", "delete"] },
        options: [
          { value: "error", label: "Error" },
          { value: "skip", label: "Skip" },
        ],
      },
    ],
    outputs: fileReadOutputs,
    executionOptions: [...ACTION_EXECUTION],
  },
  {
    id: "respond-webhook",
    label: "Respond to webhook",
    description: "Return an HTTP response to the caller.",
    kind: "action",
    category: "Actions",
    fields: [
      respondWebhookStatusField(),
      {
        key: "responseFormat",
        label: "Response format",
        placeholder: "json",
        control: "select",
        section: "parameters",
        mode: "fixed",
        options: [
          { value: "json", label: "JSON" },
          { value: "text", label: "Text" },
          { value: "binary", label: "Binary" },
        ],
      },
      {
        key: "noBody",
        label: "No body",
        placeholder: "false",
        control: "boolean",
        section: "options",
        mode: "fixed",
      },
      respondWebhookBodyField(),
      {
        key: "binary",
        label: "Binary",
        placeholder: "",
        section: "parameters",
        mode: "either",
        showWhen: { key: "responseFormat", equals: "binary" },
      },
      respondWebhookHeadersField(),
    ],
    outputs: respondWebhookOutputs,
    executionOptions: [...ACTION_EXECUTION],
  },
]

export const fileCopyMoveOutputs = fileWriteOutputs
export const fileListContract = fileListOutputs
