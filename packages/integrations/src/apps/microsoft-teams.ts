import { field, integrationApp, method, oauth } from "../define.ts"

export const microsoftTeams = integrationApp({
  id: "microsoft-teams",
  name: "Microsoft Teams",
  description: "Post to Teams channels, threads, and chats.",
  category: "Microsoft",
  iconSlug: "microsoft-teams",
  auth: oauth("microsoft", [
    "ChannelMessage.Send",
    "ChannelMessage.Read.All",
    "Channel.ReadBasic.All",
    "Channel.Create",
    "Team.ReadBasic.All",
    "TeamMember.Read.All",
    "Chat.ReadWrite",
  ]),
  sheetsTemplate: "chat",
  methods: [
    method(
      "microsoft-teams-new-message",
      "trigger",
      "Message received",
      "Start when a Microsoft Teams channel or chat message is posted.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("channel", "Channel", "General", {
          help: "Channel id or display name (resource select later).",
        }),
      ]
    ),
    method(
      "microsoft-teams-channel-created",
      "trigger",
      "Channel created",
      "Start when a channel is created in a Microsoft Teams team.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("name", "Name contains", "incidents"),
      ]
    ),
    method(
      "microsoft-teams-member-added",
      "trigger",
      "Member added",
      "Start when a member is added to a Microsoft Teams team.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
      ]
    ),
    method(
      "microsoft-teams",
      "action",
      "Post message",
      "Post a message to a Microsoft Teams channel.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("channel", "Channel", "General", {
          help: "Channel id or display name (resource select later).",
        }),
        field("message", "Message", "Workflow finished", { control: "textarea" }),
        field("mentions", "Mentions (optional)", "@ada,@ops", {
          help: "Comma-separated user or tag mentions.",
        }),
      ]
    ),
    method(
      "microsoft-teams-reply-in-thread",
      "action",
      "Reply in thread",
      "Reply to an existing Microsoft Teams channel message thread.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("channel", "Channel", "General", {
          help: "Channel id or display name (resource select later).",
        }),
        field("replyTo", "Reply to message ID", "{{Webhook.messageId}}"),
        field("message", "Message", "Following up", { control: "textarea" }),
        field("mentions", "Mentions (optional)", "@ada"),
      ]
    ),
    method(
      "microsoft-teams-update-message",
      "action",
      "Update message",
      "Edit an existing Microsoft Teams channel message.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("channel", "Channel", "General", {
          help: "Channel id or display name (resource select later).",
        }),
        field("messageId", "Message ID", "{{Webhook.messageId}}"),
        field("message", "Message", "Updated text", { control: "textarea" }),
      ]
    ),
    method(
      "microsoft-teams-list-channels",
      "action",
      "List channels",
      "List channels in a Microsoft Teams team.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
      ]
    ),
    method(
      "microsoft-teams-create-channel",
      "action",
      "Create channel",
      "Create a channel in a Microsoft Teams team.",
      [
        field("team", "Team", "Acme Ops", {
          help: "Team id or display name (resource select later).",
        }),
        field("name", "Name", "deal-acme"),
        field("description", "Description", "Acme renewal"),
      ]
    ),
  ],
})
