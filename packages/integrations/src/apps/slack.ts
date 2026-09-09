import { booleanField, field, integrationApp, method, oauth, selectField } from "../define.ts"

const SLACK_EMOJI_OPTIONS = [
  { value: "eyes", label: ":eyes:" },
  { value: "thumbsup", label: ":thumbsup:" },
  { value: "thumbsdown", label: ":thumbsdown:" },
  { value: "white_check_mark", label: ":white_check_mark:" },
  { value: "tada", label: ":tada:" },
  { value: "fire", label: ":fire:" },
  { value: "heart", label: ":heart:" },
  { value: "clap", label: ":clap:" },
  { value: "rocket", label: ":rocket:" },
  { value: "warning", label: ":warning:" },
] as const

function slackEmojiField(placeholder = "eyes") {
  return selectField("emoji", "Emoji", placeholder, SLACK_EMOJI_OPTIONS)
}

function slackMessageField(placeholder: string) {
  return field("message", "Message", placeholder, { control: "textarea" })
}

function unfurlLinksField() {
  return booleanField("unfurlLinks", "Unfurl links", true, {
    help: "Expand link previews when posting or updating Slack messages.",
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
      field("channel", "Channel", "#ops"),
    ]),
    method("slack-reaction", "trigger", "New reaction", "Start when someone reacts in Slack.", [
      field("channel", "Channel", "#ops"),
    ]),
    method("slack-new-channel", "trigger", "New channel", "Start when a Slack channel is created.", [
      field("name", "Name contains", "incidents"),
    ]),
    method("slack-app-mentioned", "trigger", "App mentioned", "Start when this app is mentioned in Slack.", [
      field("channel", "Channel", "#ops"),
    ]),
    method("slack-user-joined", "trigger", "User joined workspace", "Start when someone joins the Slack workspace.", [
      field("team", "Workspace", "Acme"),
    ]),
    method("slack", "action", "Send message", "Post a Slack message.", [
      field("channel", "Channel", "#ops"),
      slackMessageField("Workflow finished"),
      unfurlLinksField(),
    ]),
    method("slack-update-message", "action", "Update message", "Edit an existing Slack message.", [
      field("channel", "Channel", "#ops"),
      slackMessageField("Updated text"),
      unfurlLinksField(),
    ]),
    method("slack-upload-file", "action", "Upload file", "Upload a file to a Slack channel.", [
      field("channel", "Channel", "#ops"),
      field("path", "File path", "/tmp/report.pdf"),
    ]),
    method("slack-add-reaction", "action", "Add reaction", "React to a Slack message.", [
      field("channel", "Channel", "#ops"),
      slackEmojiField(),
      field("ts", "Message ts", "{{Webhook.ts}}"),
    ]),
    method("slack-create-channel", "action", "Create channel", "Create a Slack channel.", [
      field("name", "Name", "deal-acme"),
      field("topic", "Topic", "Acme renewal"),
    ]),
    method("slack-remove-reaction", "action", "Remove reaction", "Remove a reaction from a Slack message.", [
      field("channel", "Channel", "#ops"),
      slackEmojiField(),
      field("ts", "Message ts", "{{Webhook.ts}}"),
    ]),
    method("slack-invite-user", "action", "Invite user to channel", "Invite a user to a Slack channel.", [
      field("channel", "Channel", "#ops"),
      field("user", "User", "@ada"),
    ]),
  ],
})
