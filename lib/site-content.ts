export const BRAND = {
  name: "NexCoder",
  tagline:
    "A production-grade agentic coding IDE for the Nexa ecosystem. One engine powers every AI surface - the chat panel, six policy modes, and the terminal CLI.",
};

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "CLI", href: "/cli" },
  { label: "Download", href: "/download" },
];

export const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "CLI agent", href: "/cli" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    title: "Modes",
    links: [
      { label: "Agent & Edit", href: "/features#modes" },
      { label: "Ask, Review & Scan", href: "/features#modes" },
      { label: "Debug", href: "/features#modes" },
    ],
  },
  {
    title: "Nexa",
    links: [
      { label: "Nexa AI", href: "https://trynexa-ai.com" },
      { label: "Model endpoint", href: "/download#model-api" },
    ],
  },
];

export const HOME_FEATURES = [
  {
    title: "Agentic loop",
    description:
      "Plans with a visible todo list, edits files directly with checkpoint-backed revert, asks permission before running commands, and verifies its own work.",
    href: "/features",
  },
  {
    title: "Structural safety",
    description:
      "Read-only modes simply never receive mutating tools. Permission gates and a per-project command allowlist guard everything else.",
    href: "/features",
  },
  {
    title: "Auto-context",
    description:
      "The active editor file and text selection travel with every run - \"fix this\" means the selected code.",
    href: "/features",
  },
  {
    title: "Skills",
    description:
      "A skill catalog (commit, code-review, systematic-debugging, ...) the agent loads on demand. Projects add their own under .nexcoder/skills/.",
    href: "/features",
  },
  {
    title: "Context management",
    description:
      "Token budgeting, two-stage compaction, and a hard force-fit guarantee before every model call - with a live context meter in the composer.",
    href: "/features",
  },
  {
    title: "Local-first",
    description:
      "Runs fully offline against a local GGUF model server. Switching to a hosted GPU endpoint is config-only.",
    href: "/features",
  },
];

export const MODES = [
  {
    id: "agent",
    name: "Agent",
    kind: "Full access",
    description:
      "The full agentic loop: plans, edits files, runs permitted commands, and verifies the result end to end.",
  },
  {
    id: "edit",
    name: "Edit",
    kind: "Full access",
    description:
      "Focused file mutation. Direct edits with checkpoint-backed revert per run or per file.",
  },
  {
    id: "debug",
    name: "Debug",
    kind: "Full access",
    description:
      "Investigates failures systematically, reproduces them, and applies the minimal fix.",
  },
  {
    id: "ask",
    name: "Ask",
    kind: "Read-only",
    description:
      "Answers questions about your code. Structurally incapable of changing anything - mutating tools are never offered.",
  },
  {
    id: "review",
    name: "Review",
    kind: "Read-only",
    description:
      "Code review over files, diffs, or modules with findings you can act on.",
  },
  {
    id: "scan",
    name: "Scan",
    kind: "Read-only",
    description:
      "Sweeps a project for issues, risks, and structure - a fast way to learn an unfamiliar codebase.",
  },
];

export const FEATURE_SECTIONS = [
  {
    title: "One engine, every surface",
    body: "Every AI surface in NexCoder - the chat panel's Agent, Ask, Edit, Debug, Review, and Scan modes, and the terminal CLI - is a thin policy profile (system prompt + tool subset + turn budget) over the same v2 agentic core. Improve the engine once and every mode gets better.",
  },
  {
    title: "Agentic loop with real guardrails",
    body: "The agent plans with a visible todo list, edits files directly, and verifies its own work. Every mutation is preceded by a checkpoint, so you can revert per run or per file. Commands ask for permission first, with a per-project allowlist; full-auto mode still denies risky commands. Trajectories are recorded for every run.",
  },
  {
    title: "Context that follows you",
    body: "The active editor file and your text selection travel with every run, so \"fix this\" means the selected code. Natural-language code_search ranks local files and line snippets when the agent does not yet know an exact symbol - and repository content stays on your machine.",
  },
  {
    title: "Persistent, per-project memory",
    body: "Every run appends to a per-project session under .nexcoder/sessions/. Follow-up prompts replay recent conversation, history survives restarts and is browsable in the Chats sidebar, and a durable MEMORY.md holds what the agent chooses to remember.",
  },
  {
    title: "Skills, like the pros use",
    body: "A Claude-Code-style skill catalog - commit, code-review, systematic-debugging, and more - that the agent loads on demand. Invoke one directly with /skill-id in the composer or --skill on the CLI. Projects define their own under .nexcoder/skills/<id>/SKILL.md, overriding built-ins by id.",
  },
  {
    title: "Serious context management",
    body: "Token budgeting, two-stage compaction, and a hard force-fit guarantee before every model call keep long sessions on the rails, with a live context meter in the composer so you always know where you stand.",
  },
];

export const CLI_EXAMPLES = [
  {
    title: "Interactive",
    caption: "Prompts before each command; [a]lways adds it to the allowlist.",
    code: 'nexcoder --project C:\\MyApp "fix the failing test"',
  },
  {
    title: "Full auto",
    caption: "No command prompts; risky commands are still denied.",
    code: 'nexcoder --auto --project C:\\MyApp "build a landing page"',
  },
  {
    title: "Mode profiles",
    caption: "agent | ask | edit | debug | review | scan",
    code: 'nexcoder --mode review --project C:\\MyApp "review the auth module"',
  },
  {
    title: "Skills",
    caption: "Invoke a skill inline or by flag.",
    code: 'nexcoder "/commit group and commit my changes"',
  },
  {
    title: "Machine-readable events",
    caption: "JSONL event stream for tooling and CI.",
    code: 'nexcoder --jsonl --project C:\\MyApp "scan the project"',
  },
];

export const PROJECT_STATE = [
  { path: "sessions/", contents: "Chat history - index + JSONL messages per session" },
  { path: "checkpoints/", contents: "Revert snapshots taken before every mutation" },
  { path: "permissions.json", contents: "Always-allowed commands" },
  { path: "MEMORY.md", contents: "Durable project memory (agent remember tool)" },
  { path: "repo_map.json", contents: "Cached repository map" },
  { path: "trajectories/", contents: "Compact JSONL run traces" },
  { path: "skills/", contents: "Project-local skills (override built-ins by id)" },
];
