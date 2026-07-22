---
title: NexCoder User Documentation
description: Learn how to use NexCoder, navigate the workspace, choose AI modes, add context, review plans, run agents, and troubleshoot common issues.
order: 1
---

# NexCoder User Documentation

NexCoder is an AI-first coding workspace for opening real projects, editing
files, asking project-aware questions, planning changes, running agentic coding
tasks, reviewing problems, and verifying work from one desktop app.

This documentation is for NexCoder users. It explains how to use the product day
to day. It does not cover source-code development, internal architecture, or
packaging NexCoder itself.

## Getting started

Open a project folder, connect a model endpoint, and use NexCoder as a normal
editor before asking the agent to make changes.

- Open Folder gives NexCoder the full project context it needs for search,
  diagnostics, checkpoints, and verification.
- Clone Repository supports HTTPS, SSH, git, file, and scp-style URLs when Git
  is installed.
- Use Open File for quick edits, but prefer a full project folder for AI-assisted
  work.
- Configure your model endpoint and API key in Settings if your build is not
  preconfigured.
- Open the true repository root when possible so NexCoder can see package
  manifests, tests, configuration, and documentation.

## Workspace overview

NexCoder is organized around the activity sidebar, editor, AI panel, and bottom
panel so code, context, terminal output, and agent progress stay visible.

- Explorer, Search, Source Control, Extensions, Agent Tasks, and Agent Mesh live
  in the activity sidebar.
- The editor supports Monaco tabs, syntax highlighting, diagnostics, image
  previews, media previews, binary previews, and plan documents.
- The AI panel handles prompts, modes, attachments, file mentions, queued
  follow-ups, stop controls, and agent output.
- The bottom panel contains Terminal, Output, Problems, and Git Diff.
- Save files before running external tools if those tools read from disk.

## AI modes

Modes control intent and autonomy. Start read-only when exploring. Use mutating
modes only when you are ready for NexCoder to edit or run commands.

- Ask answers questions and explains code without changing files.
- Scan maps a project and finds relevant files without mutations.
- Review looks for bugs, risks, regressions, and missing tests without editing.
- Plan creates a reviewable implementation plan before any project mutation.
- Edit is for focused code changes in a known area.
- Debug is for reproducing, diagnosing, fixing, and verifying failures.
- Agent is for general coding tasks with tool use and verification.
- Terminal is for command-heavy setup, validation, or environment work.

## Asking good questions

NexCoder works best when your prompt includes a clear goal, scope, and expected
verification.

Good examples:

```text
Scan this project and explain the main frontend entry points.
```

```text
Review the authentication flow for security risks. Do not make changes.
```

```text
Fix the failing checkout tests, keep the change scoped, and run the relevant
test command before summarizing.
```

Avoid vague prompts such as "fix everything" or "make it production ready"
unless you are intentionally asking NexCoder to start with a broad scan and
propose a staged plan.

## Adding context

NexCoder works best when it can see the exact files and evidence behind your
request.

- Select relevant code before prompting when you want the AI to focus on a
  specific function or error.
- Type `@` in the AI prompt to mention project files and attach them as context.
- Attach screenshots or design references only when using a vision-capable
  model.
- Large pasted text can be saved as a project-local prompt attachment.
- Mention exact files when you want the agent to avoid unrelated areas.

## Plans and approval

Plan mode is the safest path for multi-file work, risky changes, refactors,
authentication, billing, database work, and new features.

- NexCoder explores the project and drafts a plan without changing files.
- You can answer clarification questions before the plan is finalized.
- Request revisions if the plan is too broad, misses a risk, or touches the
  wrong area.
- Approve execution only after the plan is clear and scoped.
- Save plans as Markdown when you want a durable project document.

## Agent runs

Agent runs can inspect files, search the project, update todos, edit files,
create checkpoints, run verification, and summarize the result.

- Watch the files read, commands requested, changes made, and verification
  steps.
- Use Stop if the run starts heading in the wrong direction.
- Queue follow-up prompts to steer scope at safe turn boundaries.
- Review the final summary and inspect the diff before trusting the result.
- Use checkpoint revert when an agent-made change needs to be rolled back.

## Agent Mesh

Agent Mesh is for larger goals that benefit from multiple roles, such as
exploration, implementation, testing, and review.

- Use Agent Mesh when the task spans multiple areas of the project.
- Use it when you want a broader investigation before implementation.
- Review the final status carefully. A completed mesh run does not automatically
  mean every behavior is fully verified.
- Cancel the run if the decomposition or execution no longer matches your goal.

## Diagnostics and terminal

The Problems panel and integrated terminal help you understand failures and
verify changes without leaving NexCoder.

- Problems shows diagnostics for open files when language support is available.
- You can ask NexCoder to explain or fix a diagnostic.
- Terminal sessions are project-aware and separate across project switches.
- Use the terminal to install dependencies, run tests, run builds, and inspect
  command output.
- If diagnostics are missing, check that the file is saved, language support is
  enabled, and project dependencies are installed.

## Source control

NexCoder includes source-control surfaces for Git-backed projects.

- View the current branch.
- Inspect changed files.
- Review diffs.
- Stage and unstage files.
- Create commits.
- View recent commit history.

Before committing AI-generated code, review the diff, run relevant checks, and
confirm no secrets or local-only files are included.

## Model setup

NexCoder uses OpenAI-compatible model APIs. Your organization or local setup may
preconfigure the endpoint and model. If not, configure them from Settings.

Important model settings:

- Endpoint: the OpenAI-compatible API base URL.
- Model: the provider model ID.
- API key: the credential used for the provider.
- Adapter: the model or tool-call format used by the agent.
- Context window: the total context budget.
- Output reserve: tokens reserved for the model answer.
- Temperature: randomness level.
- Max turns: how long agent runs may continue.
- Disabled tools: tool categories the agent should not use.
- Memory: whether project memory is included.

Use Test Connection after changing provider settings. Do not paste API keys into
prompts, project memory, issue descriptions, or source files.

## Safety, permissions, and privacy

NexCoder is designed around explicit boundaries, but you should still review
prompts, diffs, commands, and generated output.

- Read-only modes should not receive file mutation tools.
- File edits are checkpointed so changes can be reviewed or reverted.
- Shell commands are controlled by command policy and permission settings.
- Sensitive environment variables should be redacted unless explicitly allowed.
- Do not put API keys, passwords, customer data, or private logs into prompts or
  project memory.
- High-risk actions such as sending messages, submitting forms, deleting data,
  purchases, or account changes require explicit user approval.

## Project memory and rules

Project memory stores durable facts that NexCoder can reuse in future runs.
Rules guide the agent toward project-specific standards.

Good memory entries:

- Use `npm.cmd` on Windows for this project.
- Authentication errors should use the shared error component.
- Do not change generated files under `dist/`.

Bad memory entries:

- API keys.
- Passwords.
- Private customer data.
- Temporary guesses.
- Large logs.

NexCoder can read project rules from files such as `AGENTS.md`, `NEXCODER.md`,
or `.nexcoder/rules/*.md` when present.

## Troubleshooting

Most issues come from missing model configuration, provider limits, project
tooling, language-server setup, or unclear task scope.

- If the AI does not answer, use Test Connection and verify endpoint, API key,
  network access, and provider status.
- If the model list is empty, enter a custom model ID if you know the exact
  provider model name.
- If image attachments fail, check file type, size limits, image count, and
  whether the selected model supports vision.
- If commands fail, confirm dependencies are installed and the terminal is in
  the expected project folder.
- If diagnostics are missing, check that the file is saved, language support is
  enabled, and project dependencies are installed.
- If the agent changes the wrong file, stop the run, review the diff, revert if
  needed, and resend with tighter file mentions.

## Checklist before trusting AI changes

Before accepting or committing AI-generated work:

1. Read the final summary.
2. Review every changed file.
3. Check whether any unrelated files changed.
4. Run the relevant tests, build, lint, or type checks.
5. Confirm no secrets or private data were added.
6. Confirm behavior manually if the change affects UI, auth, billing, data,
   files, or user workflows.
7. Commit only the changes you intentionally want.
