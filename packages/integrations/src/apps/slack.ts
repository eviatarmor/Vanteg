import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function channelField(placeholder = "#ops"): MethodField {
  return field("channel", "Channel", placeholder, {
    control: "resource",
    resourceType: "slack.channel",
    help: "Pick a Slack channel from the connected workspace, or enter a custom channel name.",
  })
}

export const slack = integrationApp({
  id: "slack",
  name: "Slack",
  description: "Channels, messages, and reactions.",
  category: "Communication",
  iconSlug: "slack",
  auth: oauth("slack", [
    "channels:read",
    "channels:manage",
    "groups:write",
    "chat:write",
    "reactions:write",
    "users:read",
  ]),
  sheetsTemplate: "chat",
  toggles: [
    {
      id: "unfurlLinks",
      label: "Unfurl links in messages",
      type: "boolean",
      defaultValue: true,
    },
  ],
  methods: [
    method("slack-new-message", "trigger", "New message", "Start when a Slack message is posted.", [
      channelField(),
    ]),
    method("slack-reaction", "trigger", "New reaction", "Start when someone reacts in Slack.", [
      channelField(),
    ]),
    method("slack-new-channel", "trigger", "New channel", "Start when a Slack channel is created.", [
      field("name", "Name contains", "incidents"),
    ]),
    method("slack-app-mentioned", "trigger", "App mentioned", "Start when this app is mentioned in Slack.", [
      channelField(),
    ]),
    method("slack-user-joined", "trigger", "User joined workspace", "Start when someone joins the Slack workspace.", [
      field("team", "Workspace", "Acme"),
    ]),
    method("slack", "action", "Send message", "Post a Slack message.", [
      channelField(),
      field("message", "Message", "Workflow finished"),
    ]),
    method("slack-update-message", "action", "Update message", "Edit an existing Slack message.", [
      channelField(),
      field("message", "Message", "Updated text"),
    ]),
    method("slack-upload-file", "action", "Upload file", "Upload a file to a Slack channel.", [
      channelField(),
      field("path", "File path", "/tmp/report.pdf"),
    ]),
    method("slack-add-reaction", "action", "Add reaction", "React to a Slack message.", [
      channelField(),
      field("emoji", "Emoji", "eyes"),
      field("ts", "Message ts", "{{Webhook.ts}}"),
    ]),
    method("slack-create-channel", "action", "Create channel", "Create a Slack channel.", [
      field("name", "Name", "deal-acme"),
      field("topic", "Topic", "Acme renewal"),
    ]),
    method("slack-remove-reaction", "action", "Remove reaction", "Remove a reaction from a Slack message.", [
      channelField(),
      field("emoji", "Emoji", "eyes"),
      field("ts", "Message ts", "{{Webhook.ts}}"),
    ]),
    method("slack-invite-user", "action", "Invite user to channel", "Invite a user to a Slack channel.", [
      channelField(),
      field("user", "User", "@ada"),
    ]),
  ],
})
