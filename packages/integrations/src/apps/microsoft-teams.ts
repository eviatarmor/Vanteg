import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function teamField(placeholder = "Acme Ops"): MethodField {
  return field("team", "Team", placeholder, {
    control: "resource",
    resourceType: "teams.team",
    help: "Pick a Microsoft Teams team from the connected account, or enter a custom team id.",
  })
}

function channelField(placeholder = "General"): MethodField {
  return field("channel", "Channel", placeholder, {
    control: "resource",
    resourceType: "teams.channel",
    help: "Pick a Microsoft Teams channel from the connected team, or enter a custom channel id.",
  })
}

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
      [teamField(), channelField()]
    ),
    method(
      "microsoft-teams-channel-created",
      "trigger",
      "Channel created",
      "Start when a channel is created in a Microsoft Teams team.",
      [teamField(), field("name", "Name contains", "incidents")]
    ),
    method(
      "microsoft-teams-member-added",
      "trigger",
      "Member added",
      "Start when a member is added to a Microsoft Teams team.",
      [teamField()]
    ),
    method(
      "microsoft-teams",
      "action",
      "Post message",
      "Post a message to a Microsoft Teams channel.",
      [
        teamField(),
        channelField(),
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
        teamField(),
        channelField(),
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
        teamField(),
        channelField(),
        field("messageId", "Message ID", "{{Webhook.messageId}}"),
        field("message", "Message", "Updated text", { control: "textarea" }),
      ]
    ),
    method(
      "microsoft-teams-list-channels",
      "action",
      "List channels",
      "List channels in a Microsoft Teams team.",
      [teamField()]
    ),
    method(
      "microsoft-teams-create-channel",
      "action",
      "Create channel",
      "Create a channel in a Microsoft Teams team.",
      [
        teamField(),
        field("name", "Name", "deal-acme"),
        field("description", "Description", "Acme renewal"),
      ]
    ),
  ],
})
