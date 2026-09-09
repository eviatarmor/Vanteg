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

/** Platform Notification / File / Respond-to-webhook nodes with polished Setup fields. */
export const notifyFileNodes: WorkflowNodeType[] = [
  {
    id: "notification",
    label: "Notification",
    description: "Send a push or in-app notification.",
    kind: "action",
    category: "Actions",
    fields: [
      notificationChannelField(),
      notificationTitleField(),
      notificationMessageField(),
      notificationSeverityField(),
    ],
  },
  {
    id: "file",
    label: "File",
    description: "Read, write, list, or delete a file.",
    kind: "action",
    category: "Actions",
    fields: [filePathField(), fileOperationField(), fileContentField()],
  },
  {
    id: "respond-webhook",
    label: "Respond to webhook",
    description: "Return an HTTP response to the caller.",
    kind: "action",
    category: "Actions",
    fields: [
      respondWebhookStatusField(),
      respondWebhookBodyField(),
      respondWebhookHeadersField(),
    ],
  },
]
