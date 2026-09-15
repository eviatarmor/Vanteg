import {
  githubCommentOutputs,
  githubCommitOutputs,
  githubIssueOutputs,
  githubMergeOutputs,
  githubPullRequestOutputs,
  githubReleaseOutputs,
} from "../contracts.ts"
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
    ], { outputs: githubIssueOutputs }),
    method("github-pull-request", "trigger", "Pull request opened", "Start when a GitHub pull request is opened.", [
      repoField(),
    ], { outputs: githubPullRequestOutputs }),
    method("github-pr-merged", "trigger", "Pull request merged", "Start when a GitHub pull request is merged.", [
      repoField(),
    ], { outputs: githubPullRequestOutputs }),
    method("github-pr-closed", "trigger", "Pull request closed", "Start when a GitHub pull request is closed without merging.", [
      repoField(),
    ], { outputs: githubPullRequestOutputs }),
    method("github-issue-closed", "trigger", "Issue closed", "Start when a GitHub issue is closed.", [
      repoField(),
    ], { outputs: githubIssueOutputs }),
    method("github-new-commit", "trigger", "New commit", "Start when a commit is pushed.", [
      repoField(),
      field("branch", "Branch", "main", {
        control: "resource",
        resourceType: "github.branch",
        help: "Pick a branch, or enter a custom branch name.",
      }),
    ], { outputs: githubCommitOutputs }),
    method("github-new-release", "trigger", "Release published", "Start when a GitHub release is published.", [
      repoField(),
    ], { outputs: githubReleaseOutputs }),
    method("github", "action", "Create issue", "Create issues, comments, or pull requests.", [
      repoField(),
      selectField("action", "Action", "create_issue", [
        { value: "create_issue", label: "Create issue" },
        { value: "create_comment", label: "Create comment" },
        { value: "create_pull_request", label: "Create pull request" },
      ]),
      field("title", "Title", "Cannot log in", {
        mode: "either",
        showWhen: { key: "action", equals: ["create_issue", "create_pull_request"] },
      }),
      field("body", "Body", "Details", {
        control: "textarea",
        mode: "either",
        showWhen: { key: "action", equals: ["create_issue", "create_comment", "create_pull_request"] },
      }),
      field("number", "Issue or PR", "12", {
        mode: "either",
        showWhen: { key: "action", equals: "create_comment" },
      }),
      field("head", "Head branch", "fix/login", {
        mode: "either",
        showWhen: { key: "action", equals: "create_pull_request" },
      }),
      field("base", "Base branch", "main", {
        mode: "either",
        showWhen: { key: "action", equals: "create_pull_request" },
      }),
    ], { outputs: githubIssueOutputs }),
    method("github-comment", "action", "Create comment", "Comment on a GitHub issue or pull request.", [
      repoField(),
      field("number", "Issue or PR", "12", { mode: "either" }),
      field("body", "Comment", "Looks good", { control: "textarea", mode: "either" }),
    ], { outputs: githubCommentOutputs }),
    method("github-create-pr", "action", "Create pull request", "Open a GitHub pull request.", [
      repoField(),
      field("title", "Title", "Fix login", { mode: "either" }),
      field("head", "Head branch", "fix/login", { mode: "either" }),
      field("base", "Base branch", "main", { mode: "either" }),
    ], { outputs: githubPullRequestOutputs }),
    method("github-add-label", "action", "Add label", "Add a label to a GitHub issue or pull request.", [
      repoField(),
      field("number", "Issue or PR", "12", { mode: "either" }),
      field("label", "Label", "bug", { mode: "either" }),
    ], { outputs: githubIssueOutputs }),
    method("github-close-issue", "action", "Close issue", "Close a GitHub issue.", [
      repoField(),
      field("number", "Issue", "12", { required: true, mode: "either", validation: [{ kind: "destructive" }] }),
    ], { outputs: githubIssueOutputs }),
    method("github-merge-pr", "action", "Merge pull request", "Merge a GitHub pull request.", [
      repoField(),
      field("number", "Pull request", "34", { required: true, mode: "either", validation: [{ kind: "destructive" }] }),
    ], { outputs: githubMergeOutputs }),
    method("github-create-release", "action", "Create release", "Publish a GitHub release.", [
      repoField(),
      field("tag", "Tag", "v1.2.0", { mode: "either" }),
      field("name", "Name", "1.2.0", { mode: "either" }),
    ], { outputs: githubReleaseOutputs }),
  ],
})
