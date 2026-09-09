import { field, integrationApp, method, oauth } from "../define.ts"

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
      field("repo", "Repository", "acme/app"),
    ]),
    method("github-pull-request", "trigger", "Pull request opened", "Start when a GitHub pull request is opened.", [
      field("repo", "Repository", "acme/app"),
    ]),
    method("github-pr-merged", "trigger", "Pull request merged", "Start when a GitHub pull request is merged.", [
      field("repo", "Repository", "acme/app"),
    ]),
    method("github-pr-closed", "trigger", "Pull request closed", "Start when a GitHub pull request is closed without merging.", [
      field("repo", "Repository", "acme/app"),
    ]),
    method("github-issue-closed", "trigger", "Issue closed", "Start when a GitHub issue is closed.", [
      field("repo", "Repository", "acme/app"),
    ]),
    method("github-new-commit", "trigger", "New commit", "Start when a commit is pushed.", [
      field("repo", "Repository", "acme/app"),
      field("branch", "Branch", "main"),
    ]),
    method("github-new-release", "trigger", "Release published", "Start when a GitHub release is published.", [
      field("repo", "Repository", "acme/app"),
    ]),
    method("github", "action", "Create issue", "Create issues, comments, or pull requests.", [
      field("repo", "Repository", "acme/app"),
      field("action", "Action", "create issue"),
    ]),
    method("github-comment", "action", "Create comment", "Comment on a GitHub issue or pull request.", [
      field("repo", "Repository", "acme/app"),
      field("body", "Comment", "Looks good"),
    ]),
    method("github-create-pr", "action", "Create pull request", "Open a GitHub pull request.", [
      field("repo", "Repository", "acme/app"),
      field("title", "Title", "Fix login"),
      field("head", "Head branch", "fix/login"),
      field("base", "Base branch", "main"),
    ]),
    method("github-add-label", "action", "Add label", "Add a label to a GitHub issue or pull request.", [
      field("repo", "Repository", "acme/app"),
      field("number", "Issue or PR", "12"),
      field("label", "Label", "bug"),
    ]),
    method("github-close-issue", "action", "Close issue", "Close a GitHub issue.", [
      field("repo", "Repository", "acme/app"),
      field("number", "Issue", "12"),
    ]),
    method("github-merge-pr", "action", "Merge pull request", "Merge a GitHub pull request.", [
      field("repo", "Repository", "acme/app"),
      field("number", "Pull request", "34"),
    ]),
    method("github-create-release", "action", "Create release", "Publish a GitHub release.", [
      field("repo", "Repository", "acme/app"),
      field("tag", "Tag", "v1.2.0"),
      field("name", "Name", "1.2.0"),
    ]),
  ],
})
