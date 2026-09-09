import { field, integrationApp, method, oauth } from "../define.ts"

export const discord = integrationApp({
  id: "discord",
  name: "Discord",
  description: "Send messages to Discord channels.",
  category: "Communication",
  iconSlug: "discord",
  auth: oauth("discord", ["bot", "identify", "guilds"]),
  sheetsTemplate: "chat",
  methods: [
    method("discord-new-message", "trigger", "New message", "Start when a Discord message is posted.", [
      field("channel", "Channel", "#alerts"),
    ]),
    method("discord-new-reaction", "trigger", "New reaction", "Start when someone reacts in Discord.", [
      field("channel", "Channel", "#alerts"),
    ]),
    method("discord-member-joined", "trigger", "Member joined", "Start when a member joins a Discord server.", [
      field("server", "Server", "Acme"),
    ]),
    method("discord-member-left", "trigger", "Member left", "Start when a member leaves a Discord server.", [
      field("server", "Server", "Acme"),
    ]),
    method("discord", "action", "Send message", "Send a Discord channel message.", [
      field("channel", "Channel", "#alerts"),
      field("message", "Message", "Workflow finished"),
    ]),
    method("discord-update-message", "action", "Update message", "Edit a Discord channel message.", [
      field("channel", "Channel", "#alerts"),
      field("message", "Message", "Updated text"),
    ]),
    method("discord-add-reaction", "action", "Add reaction", "React to a Discord message.", [
      field("channel", "Channel", "#alerts"),
      field("emoji", "Emoji", "✅"),
    ]),
    method("discord-delete-message", "action", "Delete message", "Delete a Discord channel message.", [
      field("channel", "Channel", "#alerts"),
      field("messageId", "Message ID", "123"),
    ]),
    method("discord-create-channel", "action", "Create channel", "Create a Discord channel.", [
      field("server", "Server", "Acme"),
      field("name", "Name", "event-kickoff"),
    ]),
  ],
})
