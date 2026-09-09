import { createBrowserRouter } from "react-router"

import { LoginPage } from "@/features/auth/LoginPage"
import { SignUpPage } from "@/features/auth/SignUpPage"
import { AgentsPage } from "@/features/agents/AgentsPage"
import { TeamsPage } from "@/features/teams/TeamsPage"
import { ApiKeysPage } from "@/features/api-keys/ApiKeysPage"
import { DataPage } from "@/features/data/DataPage"
import { HelpPage } from "@/features/help/HelpPage"
import { HomePage } from "@/features/home/HomePage"
import { InboxPage } from "@/features/inbox/InboxPage"
import { IntegrationsPage } from "@/features/integrations/IntegrationsPage"
import { OAuthCallbackPage } from "@/features/integrations/ui/OAuthCallbackPage"
import { MemoryPage } from "@/features/memory/MemoryPage"
import { NotFoundPage } from "@/features/not-found/NotFoundPage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { AppShell } from "@/features/shell/AppShell"
import { RouteErrorPage } from "@/features/shell/RouteErrorPage"
import { WorkflowEditorPage } from "@/features/workflows/WorkflowEditorPage"
import { WorkflowsPage } from "@/features/workflows/WorkflowsPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/sign-up",
    Component: SignUpPage,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/",
    Component: AppShell,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: "inbox", Component: InboxPage },
      { path: "workflows", Component: WorkflowsPage },
      { path: "workflows/:workflowId", Component: WorkflowEditorPage },
      { path: "agents/:agentId?", Component: AgentsPage },
      { path: "teams/:teamId?", Component: TeamsPage },
      { path: "data", Component: DataPage },
      { path: "memory", Component: MemoryPage },
      { path: "integrations/oauth/callback", Component: OAuthCallbackPage },
      { path: "integrations", Component: IntegrationsPage },
      { path: "api-keys", Component: ApiKeysPage },
      { path: "help", Component: HelpPage },
      { path: "settings", Component: SettingsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
])
