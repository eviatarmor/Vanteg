import { field, integrationApp, method, oauth, selectField } from "../define.ts"
import type { MethodField } from "../types.ts"

function repoField(placeholder = "acme/app"): MethodField {
  return field("repo", "Repository", placeholder, {
    control: "resource",
    resourceType: "github.repo",
    help: "Pick a repository from the connected GitHub account, or enter owner/repo.",
  })
}

export const github = integrationApp({
  id: "github",
  name: "GitHub",
  description: "Issues, pull requests, and comments.",
  category: "Developer",
  iconSlug: "github",
  auth: oauth("github", ["repo", "read:org", "workflow"]),
  sheetsTemplate: "issue",
  methods: [
    method("github-new-issue", "trigger", "New issue", "Start when a GitHub issue is opened.", [
      repoField(),
    ]),
    method("github-pull-request", "trigger", "Pull request opened", "Start when a GitHub pull request is opened.", [
      repoField(),
    ]),
    method("github-pr-merged", "trigger", "Pull request merged", "Start when a GitHub pull request is merged.", [
      repoField(),
    ]),
    method("github-pr-closed", "trigger", "Pull request closed", "Start when a GitHub pull request is closed without merging.", [
      repoField(),
    ]),
    method("github-issue-closed", "trigger", "Issue closed", "Start when a GitHub issue is closed.", [
      repoField(),
    ]),
    method("github-new-commit", "trigger", "New commit", "Start when a commit is pushed.", [
      repoField(),
      field("branch", "Branch", "main"),
    ]),
    method("github-new-release", "trigger", "Release published", "Start when a GitHub release is published.", [
      repoField(),
    ]),
    method("github", "action", "Create issue", "Create issues, comments, or pull requests.", [
      repoField(),
      selectField("action", "Action", "create_issue", [
        { value: "create_issue", label: "Create issue" },
        { value: "create_comment", label: "Create comment" },
        { value: "create_pull_request", label: "Create pull request" },
      ]),
    ]),
    method("github-comment", "action", "Create comment", "Comment on a GitHub issue or pull request.", [
      repoField(),
      field("body", "Comment", "Looks good"),
    ]),
    method("github-create-pr", "action", "Create pull request", "Open a GitHub pull request.", [
      repoField(),
      field("title", "Title", "Fix login"),
      field("head", "Head branch", "fix/login"),
      field("base", "Base branch", "main"),
    ]),
    method("github-add-label", "action", "Add label", "Add a label to a GitHub issue or pull request.", [
      repoField(),
      field("number", "Issue or PR", "12"),
      field("label", "Label", "bug"),
    ]),
    method("github-close-issue", "action", "Close issue", "Close a GitHub issue.", [
      repoField(),
      field("number", "Issue", "12"),
    ]),
    method("github-merge-pr", "action", "Merge pull request", "Merge a GitHub pull request.", [
      repoField(),
      field("number", "Pull request", "34"),
    ]),
    method("github-create-release", "action", "Create release", "Publish a GitHub release.", [
      repoField(),
      field("tag", "Tag", "v1.2.0"),
      field("name", "Name", "1.2.0"),
    ]),
  ],
})
