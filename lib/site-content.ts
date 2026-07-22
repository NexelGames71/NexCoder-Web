export const BRAND = {
  name: "NexCoder",
  tagline:
    "A production-grade agentic coding IDE for the Nexa ecosystem. One engine powers every AI surface - the chat panel, six policy modes, and the terminal CLI.",
};

/** Public launch date. Single source for every countdown on the site. */
export const RELEASE_DATE_ISO = "2026-07-27T13:00:00.000Z";
export const RELEASE_DATE_LABEL = "July 27, 2026";

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "CLI", href: "/cli" },
  { label: "Download", href: "/download" },
];

export const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Documentation", href: "/docs" },
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

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    eyebrow: "Start building",
    price: "$0",
    period: "forever",
    description:
      "For trying NexCoder and running light AI coding sessions without a paid plan.",
    usage: "Daily usage only",
    cta: "Start free",
    href: "/download",
    featured: false,
    benefits: [
      "Desktop IDE and terminal CLI",
      "Ask, Scan, Review, Agent, Edit, Debug, and Plan modes",
      "Checkpoint-backed file revert",
      "Starter AI usage allowance",
      "Usage meter and reset timer",
    ],
    limits: ["25 daily usage units", "Daily usage resets every 24 hours", "No weekly usage bank"],
  },
  {
    id: "plus",
    name: "Plus",
    eyebrow: "Solo builder",
    price: "$20",
    annualPrice: "$16",
    period: "per month",
    description:
      "For solo developers who want more daily capacity plus a weekly usage bank.",
    usage: "150 daily units + 1,000 weekly units",
    cta: "Choose Plus",
    href: "/signup?plan=plus",
    featured: true,
    benefits: [
      "Everything in Starter, plus:",
      "Extended limits on Agent",
      "Generous limits for NexCoder Agent Mesh",
      "Generous limits for Grok and Composer",
      "Access to frontier models",
      "MCPs, skills, and hooks",
      "Cloud agents",
    ],
    limits: ["Daily usage resets every 5 hours", "Weekly usage resets every 7 days", "Agent Mesh included in usage"],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Daily agent work",
    price: "$39",
    annualPrice: "$32",
    period: "per month",
    description:
      "For developers using NexCoder as a daily agentic coding workspace across larger projects.",
    usage: "500 daily units + 3,500 weekly units",
    cta: "Choose Pro",
    href: "/signup?plan=pro",
    featured: false,
    benefits: [
      "Everything in Plus, plus:",
      "3x Pro limits on Agent",
      "Generous limits for NexCoder Agent Mesh",
      "Access to frontier models",
      "MCPs, skills, and hooks",
      "BugGuard on usage-based billing",
    ],
    limits: ["Daily usage resets every 5 hours", "Weekly usage resets every 7 days", "Higher Agent Mesh allowance"],
  },
  {
    id: "premium",
    name: "Premium",
    eyebrow: "Power user",
    price: "$99",
    annualPrice: "$80",
    period: "per month",
    description:
      "For heavy Agent Mesh, long-context coding sessions, and early access to stronger hosted models.",
    usage: "1,500 daily units + 10,000 weekly units",
    cta: "Choose Premium",
    href: "/signup?plan=premium",
    featured: false,
    benefits: [
      "Everything in Pro, plus:",
      "20x Pro limits on Agent",
      "Generous limits for NexCoder Agent Mesh",
      "Access to frontier models",
      "MCPs, skills, and hooks",
      "Cloud agents",
      "BugGuard on usage-based billing",
      "Priority access to new features",
    ],
    limits: ["Daily usage resets every 5 hours", "Weekly usage resets every 7 days", "Long-running Agent Mesh"],
  },
];

export const TEAM_PRICING_PLANS = [
  {
    name: "Business Standard",
    price: "$40",
    annualPrice: "$32",
    period: "per user / month",
    description:
      "Everything on Individual, plus centralized administration and shared team controls.",
    usage: "Team pooled daily and weekly usage",
    benefits: [
      "Everything on Individual, plus:",
      "Centralized team billing and administration",
      "Team marketplace for internal rules, skills, and plugins",
      "Agentic code reviews with BugGuard",
      "Generous limits for NexCoder Agent Mesh with shared team context",
      "Usage analytics to understand team behavior",
      "Team-wide privacy mode",
    ],
    href: "/signup?plan=business-standard",
  },
  {
    name: "Business Plus",
    price: "$120",
    period: "per user / month",
    description:
      "Everything on Individual, plus 5x Standard limits and advanced team usage capacity.",
    usage: "5x Business Standard limits",
    benefits: [
      "Everything on Individual, plus:",
      "5x Standard limits on Agent",
      "Centralized team billing and administration",
      "Team marketplace for internal rules, skills, and plugins",
      "Agentic code reviews with BugGuard",
      "Generous limits for NexCoder Agent Mesh with shared team context",
      "Usage analytics to understand team behavior",
      "Team-wide privacy mode",
    ],
    href: "/signup?plan=business-plus",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contract",
    description:
      "SAML/OIDC, SCIM, audit logs, repository and model controls, custom retention, invoice billing, and private deployment options.",
    usage: "Custom pooled usage",
    benefits: [
      "Custom security and compliance controls",
      "Custom usage pools and procurement terms",
      "Dedicated deployment and support options",
    ],
    href: "/signup?plan=enterprise",
  },
];

export const PRICING_FEATURE_ROWS = [
  ["Desktop IDE and CLI", "Included", "Included", "Included", "Included", "Included", "Included"],
  ["Daily usage", "25 units", "150 units", "500 units", "1,500 units", "Pooled", "5x Standard"],
  ["Daily reset", "Every 24 hours", "Every 5 hours", "Every 5 hours", "Every 5 hours", "Admin controlled", "Admin controlled"],
  ["Weekly usage", "-", "1,000 units", "3,500 units", "10,000 units", "Pooled", "5x Standard"],
  ["Weekly reset", "-", "Every 7 days", "Every 7 days", "Every 7 days", "Admin controlled", "Admin controlled"],
  ["Agent Mesh", "Limited", "Generous limits", "Generous limits", "Generous limits", "Shared team context", "Shared team context"],
  ["Frontier models", "-", "Included", "Included", "Included", "Included", "Included"],
  ["MCPs, skills, and hooks", "-", "Included", "Included", "Included", "Team marketplace", "Team marketplace"],
  ["BugGuard", "-", "-", "Usage-based billing", "Usage-based billing", "Code reviews", "Code reviews"],
  ["Team administration", "-", "-", "-", "-", "Included", "Included"],
  ["Team-wide privacy mode", "-", "-", "-", "-", "Included", "Included"],
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
