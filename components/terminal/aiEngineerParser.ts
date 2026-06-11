// Terminal state machine for AI Engineer Lab. Pure functions — no side effects.
// Mirrors components/terminal/commandParser.ts (Claude Lab).
// Original Gradland content; methodology concepts credited to Matt Pocock's
// publicly described "AI Coding for Real Engineers" Engineer's Path.

export interface TerminalState {
  xp: number;
  completedMissions: number[];
  currentMission: number | null;
  currentChallenge: number;
  earnedBadges: string[];
}

export interface CommandOutput {
  lines: string[];
  newState: TerminalState;
  shouldClear?: boolean;
}

// ── ANSI colour helpers ───────────────────────────────────────────
const b  = (s: string) => `\x1b[1m${s}\x1b[0m`;
const g  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const y  = (s: string) => `\x1b[33m${s}\x1b[0m`;
const c  = (s: string) => `\x1b[36m${s}\x1b[0m`;
const r  = (s: string) => `\x1b[31m${s}\x1b[0m`;
const d  = (s: string) => `\x1b[2m${s}\x1b[0m`;

export const MISSION_COUNT = 15;

// ── Level system ──────────────────────────────────────────────────
const LEVELS = [
  { threshold: 0,   name: 'Vibe Coder' },
  { threshold: 100, name: 'Apprentice' },
  { threshold: 250, name: 'Practitioner' },
  { threshold: 400, name: 'AI Engineer' },
  { threshold: 500, name: 'Path Master' },
];

export function getLevel(xp: number): { level: number; name: string; nextThreshold: number } {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) idx = i;
  }
  return {
    level: idx,
    name: LEVELS[idx].name,
    nextThreshold: idx < LEVELS.length - 1 ? LEVELS[idx + 1].threshold : Infinity,
  };
}

// ── Badge system ──────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  condition: (state: TerminalState) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first_mission',
    name: 'First Steps',
    description: 'Complete your first mission',
    condition: (s) => s.completedMissions.length >= 1,
  },
  {
    id: 'context_keeper',
    name: 'Context Keeper',
    description: 'Complete all 5 Fundamentals & Steering missions',
    condition: (s) => [1, 2, 3, 4, 5].every(id => s.completedMissions.includes(id)),
  },
  {
    id: 'master_planner',
    name: 'Master Planner',
    description: 'Complete all 5 Plan & Decompose missions',
    condition: (s) => [6, 7, 8, 9, 10].every(id => s.completedMissions.includes(id)),
  },
  {
    id: 'loop_runner',
    name: 'Loop Runner',
    description: 'Complete all 5 Feedback Loops & AFK missions',
    condition: (s) => [11, 12, 13, 14, 15].every(id => s.completedMissions.includes(id)),
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete all 15 missions',
    condition: (s) => s.completedMissions.length >= 15,
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Reach 100 XP',
    condition: (s) => s.xp >= 100,
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    description: 'Reach 250 XP',
    condition: (s) => s.xp >= 250,
  },
  {
    id: 'path_master',
    name: 'Path Master',
    description: 'Reach 500 XP — walk the full Engineer\'s Path',
    condition: (s) => s.xp >= 500,
  },
];

export const BADGE_COUNT = BADGES.length;

export function awardBadges(state: TerminalState): { state: TerminalState; newBadges: Badge[] } {
  const newBadges = BADGES.filter(
    b => !state.earnedBadges.includes(b.id) && b.condition(state),
  );
  if (newBadges.length === 0) return { state, newBadges: [] };
  return {
    state: { ...state, earnedBadges: [...state.earnedBadges, ...newBadges.map(b => b.id)] },
    newBadges,
  };
}

function announceBadges(badges: Badge[]): string[] {
  return badges.flatMap(badge => [
    '',
    y('🏆') + b(` Badge unlocked: "${badge.name}"`),
    d(`   ${badge.description}`),
  ]);
}

// ── Mission catalogue ─────────────────────────────────────────────
interface Mission {
  id: number;
  title: string;
  xp: number;
  track: number;
  available: boolean;
}

const MISSIONS: Mission[] = [
  { id:  1, title: "The Context Window"              , xp: 25, track: 1, available: true },
  { id:  2, title: "Plan / Execute / Clear"          , xp: 30, track: 1, available: true },
  { id:  3, title: "Steering with AGENTS.md"         , xp: 30, track: 1, available: true },
  { id:  4, title: "Progressive Disclosure"          , xp: 30, track: 1, available: true },
  { id:  5, title: "Subagent Strategies"             , xp: 40, track: 1, available: true },
  { id:  6, title: "Exploring Large Codebases"       , xp: 25, track: 2, available: true },
  { id:  7, title: "Writing a PRD"                   , xp: 30, track: 2, available: true },
  { id:  8, title: "Tracer Bullets"                  , xp: 35, track: 2, available: true },
  { id:  9, title: "Decomposing Features"            , xp: 35, track: 2, available: true },
  { id: 10, title: "Multi-Phase Execution"           , xp: 40, track: 2, available: true },
  { id: 11, title: "Types, Tests & Reviews"          , xp: 30, track: 3, available: true },
  { id: 12, title: "Pre-commit Safety Nets"          , xp: 30, track: 3, available: true },
  { id: 13, title: "The Ralph Loop (HITL)"           , xp: 40, track: 3, available: true },
  { id: 14, title: "AFK Agents & Sandboxing"         , xp: 40, track: 3, available: true },
  { id: 15, title: "Issues, Kanban & Priority"       , xp: 50, track: 3, available: true },
];

// ── Challenge type ────────────────────────────────────────────────
interface Challenge {
  prompt: string[];
  hint: string;
  validate: (input: string) => boolean;
  successLines: string[];
  xp: number;
}

// ── Mission 01: The Context Window ──
const MISSION_01: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/2'),
      '',
      "  Every word you paste and every file the agent reads fills one shared",
      "  context window. As it fills, answer quality quietly degrades.",
      "  Step one of context engineering: know what you are spending.",
      `  Try: ${c("/context")}`,
    ],
    hint: "Use the slash command /context to inspect what fills the window." + ' e.g. ' + c("/context"),
    validate: (input) => new RegExp("^\\s*\\/context\\b").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Context is a budget, not a bucket.",
      d("  Every token is paid attention -- spend it on purpose."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/2'),
      '',
      "  A finished task leaves dead weight behind: old diffs, stale ideas,",
      "  abandoned approaches. None of it helps the next task -- it only",
      "  distracts the model. Wipe the window before starting fresh work.",
      `  Try: ${c("/clear")}`,
    ],
    hint: "Use the slash command /clear to reset the context window." + ' e.g. ' + c("/clear"),
    validate: (input) => new RegExp("^\\s*\\/clear\\b").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "A fresh window is the cheapest performance upgrade.",
      d("  Clear between tasks, not just when things break."),
    ],
    xp: 15,
  },
];

// ── Mission 02: Plan / Execute / Clear ──
const MISSION_02: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Planning and executing in one long session pollutes the window.",
      "  Instead, get the plan OUT of the chat and INTO a file you can",
      "  reload anytime. Ask Claude to write steps down -- and zero code.",
      `  Try: ${c("claude \"Plan the login flow into PLAN.md, no code yet\"")}`,
    ],
    hint: "Run claude \"...\" with a prompt that asks for a plan in PLAN.md." + ' e.g. ' + c("claude \"Plan the login flow into PLAN.md, no code yet\""),
    validate: (input) => new RegExp("claude\\s+[\"'][^\"']*PLAN\\.md[^\"']*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "A plan on disk survives any /clear.",
      d("  Plans in files are durable; plans in chat evaporate."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  The plan now lives on disk, so the conversation that produced it",
      "  is pure overhead. Drop it. A fresh window executes plans better",
      "  than the cluttered session that wrote them.",
      `  Try: ${c("/clear")}`,
    ],
    hint: "Use /clear to reset the session between planning and executing." + ' e.g. ' + c("/clear"),
    validate: (input) => new RegExp("^\\s*\\/clear\\b").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Plan, clear, then execute -- the core loop.",
      d("  Never make one session do two jobs."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  New session, empty window, plan on disk. Now point Claude at the",
      "  file and let it work through the steps with full attention.",
      `  Try: ${c("claude \"Read PLAN.md and execute step 1\"")}`,
    ],
    hint: "Run claude \"...\" asking it to read PLAN.md and execute a step." + ' e.g. ' + c("claude \"Read PLAN.md and execute step 1\""),
    validate: (input) => new RegExp("claude\\s+[\"'][^\"']*(?:[Ee]xecute|[Ii]mplement)[^\"']*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The executor starts clean and focused.",
      d("  Plan / Execute / Clear: repeat this loop for every task."),
    ],
    xp: 10,
  },
];

// ── Mission 03: Steering with AGENTS.md ──
const MISSION_03: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/2'),
      '',
      "  Tired of repeating 'we use TypeScript strict' every session?",
      "  A steering file like AGENTS.md is loaded automatically, so a rule",
      "  you write once applies to every future conversation.",
      `  Try: ${c("echo \"Stack: Next.js 16, TypeScript strict\" >> AGENTS.md")}`,
    ],
    hint: "Use echo \"your rule\" >> AGENTS.md to append a project rule." + ' e.g. ' + c("echo \"Stack: Next.js 16, TypeScript strict\" >> AGENTS.md"),
    validate: (input) => new RegExp("echo\\s+[\"'].+[\"']\\s*>>?\\s*AGENTS\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Rules beat repetition.",
      d("  Write it once in AGENTS.md; never type it in chat again."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 2/2'),
      '',
      "  A steering file is only useful if it stays true. Review it the",
      "  way the agent sees it at the start of every single session.",
      `  Try: ${c("cat AGENTS.md")}`,
    ],
    hint: "Use cat AGENTS.md to read the steering file." + ' e.g. ' + c("cat AGENTS.md"),
    validate: (input) => new RegExp("cat\\s+(\\.\\/)?AGENTS\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Audit your steering file like production code.",
      d("  Stale rules steer the agent into stale habits."),
    ],
    xp: 15,
  },
];

// ── Mission 04: Progressive Disclosure ──
const MISSION_04: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/2'),
      '',
      "  A steering file that lists every detail becomes its own context",
      "  problem. Keep the always-loaded file lean; park deep detail in",
      "  reference docs the agent opens only when a task needs them.",
      `  Try: ${c("echo \"Deep DB schema notes live here\" > docs/db-reference.md")}`,
    ],
    hint: "Use echo \"...\" > docs/db-reference.md to create a reference doc." + ' e.g. ' + c("echo \"Deep DB schema notes live here\" > docs/db-reference.md"),
    validate: (input) => new RegExp("echo\\s+[\"'].+[\"']\\s*>>?\\s*\\S*reference\\S*\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Detail on demand, not detail by default.",
      d("  Lean files always loaded; heavy files loaded when needed."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 2/2'),
      '',
      "  Now leave a signpost. One pointer line in AGENTS.md costs a few",
      "  tokens; pasting the full document costs hundreds every session.",
      `  Try: ${c("echo \"DB details: see docs/db-reference.md\" >> AGENTS.md")}`,
    ],
    hint: "Append a one-line pointer to AGENTS.md with echo \"...\" >> AGENTS.md." + ' e.g. ' + c("echo \"DB details: see docs/db-reference.md\" >> AGENTS.md"),
    validate: (input) => new RegExp("echo\\s+[\"'].+[\"']\\s*>>\\s*AGENTS\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "That is progressive disclosure.",
      d("  Cheap pointers up front, expensive detail behind them."),
    ],
    xp: 15,
  },
];

// ── Mission 05: Subagent Strategies ──
const MISSION_05: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Exploration is expensive: reading ten files to answer one question",
      "  floods your window. Hand the question to a one-shot subagent with",
      "  claude -p. Only its answer comes back -- not the files it read.",
      `  Try: ${c("claude -p \"How does auth flow through this codebase?\"")}`,
    ],
    hint: "Run claude -p \"your research question\" for a one-shot subagent." + ' e.g. ' + c("claude -p \"How does auth flow through this codebase?\""),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].+[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The subagent burns its own context, not yours.",
      d("  Delegate the reading; keep only the findings."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  A subagent's findings vanish when it exits -- unless you save them.",
      "  Redirect the answer to a file any future session can read.",
      `  Try: ${c("claude -p \"List all API routes and their auth checks\" > report.md")}`,
    ],
    hint: "Run claude -p \"...\" > report.md to save subagent output to a file." + ' e.g. ' + c("claude -p \"List all API routes and their auth checks\" > report.md"),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].+[\"']\\s*>\\s*\\S+\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Research written to disk is research you never redo.",
      d("  Files are memory; context is scratch paper."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  Inside a live session you can also delegate: ask Claude to spawn",
      "  an explore subagent. It digs through code in its own window and",
      "  returns conclusions, not file dumps, to yours.",
      `  Try: ${c("claude \"Spawn a subagent to explore payments, report back\"")}`,
    ],
    hint: "Run claude \"...\" asking it to spawn a subagent to explore an area." + ' e.g. ' + c("claude \"Spawn a subagent to explore payments, report back\""),
    validate: (input) => new RegExp("claude\\s+[\"'][^\"']*[Ss]ub-?agent[^\"']*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "One orchestrator, many disposable explorers.",
      d("  Protect the main window; let subagents take the mess."),
    ],
    xp: 15,
  },
];

// ── Mission 06: Exploring Large Codebases ──
const MISSION_06: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Before changing unfamiliar code, build a mental map first.",
      "  grep finds strings; the agent can explain structure and intent.",
      "  Ask for a high-level architecture summary before touching anything.",
      `  Try: ${c("claude -p \"Summarize the architecture of this codebase\"")}`,
    ],
    hint: "Use claude -p \"...\" asking for an architecture summary" + ' e.g. ' + c("claude -p \"Summarize the architecture of this codebase\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Ss]ummar|[Aa]rchitect|[Oo]verview|[Ee]xplain).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The agent reads structure and intent, not just strings.",
      d("  Map before you modify - a summary beats an hour of blind grepping."),
    ],
    xp: 8,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  A summary is the map; tracing one request is the street view.",
      "  Pick a single endpoint and follow it through every layer:",
      "  route, handler, validation, database, response.",
      `  Try: ${c("claude -p \"Trace the request flow for POST /api/jobs\"")}`,
    ],
    hint: "Use claude -p \"Trace ...\" naming one specific endpoint" + ' e.g. ' + c("claude -p \"Trace the request flow for POST /api/jobs\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Tt]race|[Ff]ollow|[Ww]alk).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "One traced path teaches you the shape of every path.",
      d("  Trace one request end to end before you write your first line."),
    ],
    xp: 8,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  Every codebase has house rules: naming, auth checks, error",
      "  shapes, folder layout. Code that matches the conventions gets",
      "  merged; code that fights them gets rewritten. Ask what they are.",
      `  Try: ${c("claude -p \"What conventions do the API routes follow?\"")}`,
    ],
    hint: "Use claude -p \"...\" asking about conventions or patterns" + ' e.g. ' + c("claude -p \"What conventions do the API routes follow?\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Cc]onvention|[Pp]attern|[Hh]ouse rule|[Ss]tyle).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Conventions are the codebase's unwritten spec.",
      d("  Match the house style - consistency is a feature."),
    ],
    xp: 9,
  },
];

// ── Mission 07: Writing a PRD ──
const MISSION_07: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Vague ideas produce vague code. A PRD pins the target down.",
      "  Start with the two hardest questions: what is the smallest",
      "  useful version (MVP), and what are you deliberately NOT",
      "  building (non-goals)?",
      `  Try: ${c("claude \"Draft PRD.md for a salary insights tool: MVP, non-goals\"")}`,
    ],
    hint: "Ask claude to draft PRD.md, mentioning PRD in your prompt" + ' e.g. ' + c("claude \"Draft PRD.md for a salary insights tool: MVP, non-goals\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*[Pp][Rr][Dd].*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "PRD.md drafted with an MVP and explicit non-goals.",
      d("  Non-goals are scope armour - they stop the feature from sprawling."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  A PRD without users is a wish list. Add user stories in the",
      "  form: as a 485 grad, I want X so that Y. Then write success",
      "  criteria - how you will know the feature actually works.",
      `  Try: ${c("claude \"Add user stories and success criteria to PRD.md\"")}`,
    ],
    hint: "Ask claude to add user stories and success criteria to the PRD" + ' e.g. ' + c("claude \"Add user stories and success criteria to PRD.md\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Uu]ser stor|[Ss]uccess criteria|[Aa]cceptance).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Stories give the work a who; criteria give it a finish line.",
      d("  If you can't verify it, you can't ship it."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  Big PRDs fail when built as one giant lump. Slice the work",
      "  into phases, each small enough to ship and verify on its own.",
      "  Every phase gets its own written validation step.",
      `  Try: ${c("claude \"Split PRD.md into small phases with validation steps\"")}`,
    ],
    hint: "Ask claude to split the PRD into phases with validation" + ' e.g. ' + c("claude \"Split PRD.md into small phases with validation steps\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Pp]hase|[Mm]ilestone|[Ss]lice).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "A phased PRD is a plan you can actually execute.",
      d("  Each phase: small, shippable, and checkable before the next."),
    ],
    xp: 10,
  },
];

// ── Mission 08: Tracer Bullets ──
const MISSION_08: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Don't build the whole feature on an unproven architecture.",
      "  Fire a tracer bullet first: the thinnest slice that touches",
      "  every layer - one route, one query, one render. Ugly is fine;",
      "  connected is the point.",
      `  Try: ${c("claude \"Build a tracer bullet: one route, one query, one render\"")}`,
    ],
    hint: "Ask claude to build a tracer bullet / thin end-to-end slice" + ' e.g. ' + c("claude \"Build a tracer bullet: one route, one query, one render\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Tt]racer|[Tt]hin slice|end[- ]to[- ]end|one route).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The tracer proves the layers actually connect.",
      d("  Validate the architecture before you invest in the feature."),
    ],
    xp: 12,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  A tracer bullet only counts when you watch it land.",
      "  Hit the new endpoint yourself and confirm real data flows",
      "  through every layer, end to end.",
      `  Try: ${c("curl -s localhost:3000/api/salary/preview")}`,
    ],
    hint: "curl the local endpoint, e.g. curl -s localhost:3000/api/..." + ' e.g. ' + c("curl -s localhost:3000/api/salary/preview"),
    validate: (input) => new RegExp("curl\\s+(-\\w+\\s+)*(https?:\\/\\/)?localhost(:\\d+)?\\/\\S+").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Real bytes came back through every layer.",
      d("  Seeing it work beats believing it should work."),
    ],
    xp: 12,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  The slice works - lock in the proof before you expand it.",
      "  Commit the tracer so every later task builds on a known-good",
      "  path you can always revert to.",
      `  Try: ${c("git commit -m \"tracer: salary preview path works end to end\"")}`,
    ],
    hint: "git commit -m \"tracer: ...\" to lock in the proven slice" + ' e.g. ' + c("git commit -m \"tracer: salary preview path works end to end\""),
    validate: (input) => new RegExp("git\\s+commit\\s+-(a?m)\\s+[\"'].+[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Known-good checkpoint saved.",
      d("  Now widen the slice - the risky part is already behind you."),
    ],
    xp: 11,
  },
];

// ── Mission 09: Decomposing Features ──
const MISSION_09: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  A context window is a budget. A task that overflows it causes",
      "  drift, half-edits, and forgotten constraints. Decompose each",
      "  phase into tasks that fit one clean agent session.",
      `  Try: ${c("claude \"Break PRD.md phase 1 into small, verifiable tasks\"")}`,
    ],
    hint: "Ask claude to break a PRD phase into small verifiable tasks" + ' e.g. ' + c("claude \"Break PRD.md phase 1 into small, verifiable tasks\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Bb]reak|[Dd]ecompos|[Ss]plit|small.{0,20}task).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Each task now fits inside one focused session.",
      d("  Size tasks for the context window, not the calendar."),
    ],
    xp: 12,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  Tasks that live only in chat evaporate the moment you /clear.",
      "  Write each one down where any agent - or human - can pick it",
      "  up cold, with no chat history required.",
      `  Try: ${c("gh issue create -t \"Add salary table migration\" -b \"Phase 1\"")}`,
    ],
    hint: "gh issue create -t \"task title\" -b \"details\"" + ' e.g. ' + c("gh issue create -t \"Add salary table migration\" -b \"Phase 1\""),
    validate: (input) => new RegExp("gh\\s+issue\\s+create\\s+(-t|--title)\\s+[\"'].+[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The task now survives outside your context window.",
      d("  Issues are durable memory; chat is not."),
    ],
    xp: 12,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  The sizing rule: if a task cannot be finished AND verified",
      "  in a single session, it is not one task - it is two.",
      "  When in doubt, split it.",
      `  Try: ${c("claude \"Task 3 is too big for one session. Split it in two\"")}`,
    ],
    hint: "Tell claude the task is too big and ask it to split it" + ' e.g. ' + c("claude \"Task 3 is too big for one session. Split it in two\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Ss]plit|[Tt]oo big|two task|smaller).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Two small tasks beat one stalled one.",
      d("  Too big for one session means it was always two tasks."),
    ],
    xp: 11,
  },
];

// ── Mission 10: Multi-Phase Execution ──
const MISSION_10: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Execute one phase per session - never the whole plan at once.",
      "  Scope the agent hard: this phase only, nothing beyond it.",
      "  Tight scope keeps the diff small and reviewable.",
      `  Try: ${c("claude \"Implement phase 1 of PRD.md, nothing beyond it\"")}`,
    ],
    hint: "Ask claude to implement phase 1 only, scoped to the plan" + ' e.g. ' + c("claude \"Implement phase 1 of PRD.md, nothing beyond it\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*[Pp]hase\\s*\\d.*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "One phase, one session, one reviewable diff.",
      d("  Scope discipline is what makes multi-phase plans finish."),
    ],
    xp: 13,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  Never start phase 2 on top of an unverified phase 1 - bugs",
      "  compound across phases. Run the project's checks and let a",
      "  green build gate the next step.",
      `  Try: ${c("npm run check")}`,
    ],
    hint: "Run the project checks: npm run check (or build/test)" + ' e.g. ' + c("npm run check"),
    validate: (input) => new RegExp("npm\\s+(run\\s+)?(check|build|test)\\b").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Green checks are your licence to continue.",
      d("  Verify every phase before the next - errors compound."),
    ],
    xp: 13,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  The plan file is shared memory between sessions. Mark the",
      "  phase done, note any surprises or follow-ups, then /clear",
      "  so phase 2 starts with a fresh, focused context.",
      `  Try: ${c("claude \"Mark phase 1 done in PRD.md and note follow-ups\"")}`,
    ],
    hint: "Ask claude to mark phase 1 done in PRD.md before clearing" + ' e.g. ' + c("claude \"Mark phase 1 done in PRD.md and note follow-ups\""),
    validate: (input) => new RegExp("claude\\s+(-p\\s+)?[\"'].*([Mm]ark|[Uu]pdate|[Dd]one|complete).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The plan now reflects reality - /clear and go again.",
      d("  Plan, execute, verify, update, clear. That loop ships features."),
    ],
    xp: 14,
  },
];

// ── Mission 11: Types, Tests & Reviews ──
const MISSION_11: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  An agent can't see your screen. It only sees command output.",
      "  Strict types turn vague bugs into exact, fixable error messages.",
      "  Run the TypeScript compiler in check-only mode to surface them.",
      `  Try: ${c("npx tsc --noEmit")}`,
    ],
    hint: "Run the type checker: npx tsc --noEmit" + ' e.g. ' + c("npx tsc --noEmit"),
    validate: (input) => new RegExp("(npx\\s+)?tsc\\s+--noEmit").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "12 errors printed, each with a file and line number.",
      d("  Machine-checkable feedback beats 'it looks wrong' every time."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  Now hand that failure output to the agent and let it iterate.",
      "  The loop: run the check, read the errors, patch, run it again.",
      "  It stops only when the output is green.",
      `  Try: ${c("claude -p \"run npm test and fix every failure until green\"")}`,
    ],
    hint: "claude -p \"...\" — ask it to run tests and fix until green" + ' e.g. ' + c("claude -p \"run npm test and fix every failure until green\""),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].*(test|fix|green).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The agent loops: test, read failure, patch, retest.",
      d("  Failing output IS the steering wheel — give agents a way to fail."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  Linters catch a third class of feedback: style and footguns.",
      "  Types, tests, lint — three automated reviewers that never tire.",
      "  Wire all three in and agents review their own work for free.",
      `  Try: ${c("npm run lint")}`,
    ],
    hint: "Run the linter: npm run lint" + ' e.g. ' + c("npm run lint"),
    validate: (input) => new RegExp("npm\\s+run\\s+lint").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Lint clean. Your feedback triangle is complete.",
      d("  Every check you automate is a review you never have to repeat."),
    ],
    xp: 10,
  },
];

// ── Mission 12: Pre-commit Safety Nets ──
const MISSION_12: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Agents sometimes commit broken code. Hooks make that impossible.",
      "  A pre-push hook runs your checks before anything leaves the repo.",
      "  Write one that runs the full check script.",
      `  Try: ${c("echo \"npm run check\" > .git/hooks/pre-push")}`,
    ],
    hint: "echo \"<check command>\" > .git/hooks/pre-push" + ' e.g. ' + c("echo \"npm run check\" > .git/hooks/pre-push"),
    validate: (input) => new RegExp("echo\\s+[\"'].+[\"']\\s*>>?\\s*\\.git/hooks/pre-push").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The hook script now exists.",
      d("  A safety net that runs itself is worth ten that rely on memory."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  Git only runs hooks that are executable.",
      "  One forgotten chmod and your safety net silently does nothing.",
      `  Try: ${c("chmod +x .git/hooks/pre-push")}`,
    ],
    hint: "Make the hook executable: chmod +x .git/hooks/pre-push" + ' e.g. ' + c("chmod +x .git/hooks/pre-push"),
    validate: (input) => new RegExp("chmod\\s+\\+x\\s+\\.git/hooks/pre-push").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The hook is live.",
      d("  Always test that a guard actually fires — silent guards are traps."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  Now every push — yours or an agent's — must pass the build first.",
      "  Trigger the hook by pushing.",
      `  Try: ${c("git push origin main")}`,
    ],
    hint: "Push to trigger the hook: git push origin main" + ' e.g. ' + c("git push origin main"),
    validate: (input) => new RegExp("git\\s+push(\\s+\\S+)*").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The hook ran npm run check before the push went out.",
      d("  Bad agent output now physically cannot land on main."),
    ],
    xp: 10,
  },
];

// ── Mission 13: The Ralph Loop (HITL) ──
const MISSION_13: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  The Ralph loop runs an agent repeatedly against one task list.",
      "  Each pass: pick the top task, build it, verify, open a PR.",
      "  Start by adding a task to the list.",
      `  Try: ${c("echo \"- [ ] add empty-state to jobs page\" >> TODO.md")}`,
    ],
    hint: "Append a task: echo \"- [ ] <task>\" >> TODO.md" + ' e.g. ' + c("echo \"- [ ] add empty-state to jobs page\" >> TODO.md"),
    validate: (input) => new RegExp("echo\\s+[\"'].+[\"']\\s*>>\\s*TODO\\.md").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Task queued.",
      d("  A loop is only as good as the list that feeds it."),
    ],
    xp: 10,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  One iteration = one small task, fully shipped as a PR.",
      "  Fresh context each pass keeps the agent sharp and cheap.",
      "  Kick off a single loop iteration.",
      `  Try: ${c("claude -p \"take the top TODO.md task, build it, open a PR\"")}`,
    ],
    hint: "claude -p \"...\" — top task from TODO.md, build, open a PR" + ' e.g. ' + c("claude -p \"take the top TODO.md task, build it, open a PR\""),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].*(TODO|task).*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "One task in, one verified PR out.",
      d("  Small loops compound; big plans collapse."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  HITL means a human gates every merge.",
      "  You review the diff; the agent never merges its own work.",
      `  Try: ${c("gh pr diff 42")}`,
    ],
    hint: "Review the agent's PR: gh pr diff <number>" + ' e.g. ' + c("gh pr diff 42"),
    validate: (input) => new RegExp("gh\\s+pr\\s+(diff|view)(\\s+\\d+)?").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "You are the quality gate at the end of every loop.",
      d("  Loop the agent, but keep a human hand on the merge button."),
    ],
    xp: 15,
  },
];

// ── Mission 14: AFK Agents & Sandboxing ──
const MISSION_14: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  AFK agents run with nobody watching, so limit what they touch.",
      "  An allowlist of tools is the cheapest sandbox you can buy.",
      "  Run a prompt with only read and edit access — no shell.",
      `  Try: ${c("claude -p \"fix all lint errors\" --allowedTools \"Read,Edit\"")}`,
    ],
    hint: "claude -p \"...\" --allowedTools \"Read,Edit\"" + ' e.g. ' + c("claude -p \"fix all lint errors\" --allowedTools \"Read,Edit\""),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].+[\"']\\s+--allowedTools\\s+[\"']?.+").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The agent can edit files but can't run arbitrary shell.",
      d("  Trust the loop, not the agent — fence the blast radius first."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  Unattended loops can burn quota forever. Cap the iterations.",
      "  A turn limit means a stuck agent stops instead of spending.",
      `  Try: ${c("claude -p \"fix flaky tests\" --max-turns 10")}`,
    ],
    hint: "Add an iteration cap: claude -p \"...\" --max-turns <n>" + ' e.g. ' + c("claude -p \"fix flaky tests\" --max-turns 10"),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].+[\"'].*--max-turns\\s+\\d+").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Worst case is now 10 turns, not an infinite bill.",
      d("  Every AFK agent needs a budget and a kill switch."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  AFK output should land as a PR on a branch, never direct on main.",
      "  Give the agent its own branch namespace before it starts.",
      `  Try: ${c("git checkout -b ai/agent/fix-lint")}`,
    ],
    hint: "Create an agent branch: git checkout -b ai/agent/<task>" + ' e.g. ' + c("git checkout -b ai/agent/fix-lint"),
    validate: (input) => new RegExp("git\\s+(checkout\\s+-b|switch\\s+-c)\\s+\\S+").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "Branch isolated. Worst case is a closed PR, not a revert.",
      d("  Sandbox + tool limits + caps + PR-only = sleep-safe automation."),
    ],
    xp: 10,
  },
];

// ── Mission 15: Issues, Kanban & Priority ──
const MISSION_15: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/3'),
      '',
      "  Rigid mega-plans go stale; a prioritised queue stays alive.",
      "  Each issue needs acceptance criteria an agent can verify.",
      "  Create one with a clear, checkable definition of done.",
      `  Try: ${c("gh issue create --title \"salary filter\" --body \"AC: saved in URL\"")}`,
    ],
    hint: "gh issue create --title \"...\" --body \"AC: ...\"" + ' e.g. ' + c("gh issue create --title \"salary filter\" --body \"AC: saved in URL\""),
    validate: (input) => new RegExp("gh\\s+issue\\s+create\\s+.*--title\\s+[\"'].+[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "An issue an agent can finish without asking questions.",
      d("  Acceptance criteria are the test the agent writes itself against."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 2/3'),
      '',
      "  A queue only works if the top item is genuinely the top.",
      "  Labels like p1/p2 let agents and humans pull in the same order.",
      `  Try: ${c("gh issue edit 12 --add-label \"p1\"")}`,
    ],
    hint: "Set priority with a label: gh issue edit <n> --add-label \"p1\"" + ' e.g. ' + c("gh issue edit 12 --add-label \"p1\""),
    validate: (input) => new RegExp("gh\\s+issue\\s+(edit|list)\\s+.*label").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "The queue now has an order, not just a pile.",
      d("  Prioritise once, then let every agent pull from the same top."),
    ],
    xp: 15,
  },
  {
    prompt: [
      b('Challenge 3/3'),
      '',
      "  One owner per task — two agents on one issue means merge hell.",
      "  Point the agent at exactly one issue and its criteria.",
      `  Try: ${c("claude -p \"implement issue #12 only, meet its acceptance criteria\"")}`,
    ],
    hint: "claude -p \"implement issue #<n> only ...\"" + ' e.g. ' + c("claude -p \"implement issue #12 only, meet its acceptance criteria\""),
    validate: (input) => new RegExp("claude\\s+-p\\s+[\"'].*issue.*[\"']").test(input),
    successLines: [
      g('✅ Correct!') + ' ' + "One issue, one owner, one branch, one PR.",
      d("  The kanban board is the plan now — and it never goes stale."),
    ],
    xp: 20,
  },
];

// ── Mission challenge registry ────────────────────────────────────
const MISSION_CHALLENGES: Record<number, Challenge[]> = {
   1: MISSION_01,
   2: MISSION_02,
   3: MISSION_03,
   4: MISSION_04,
   5: MISSION_05,
   6: MISSION_06,
   7: MISSION_07,
   8: MISSION_08,
   9: MISSION_09,
  10: MISSION_10,
  11: MISSION_11,
  12: MISSION_12,
  13: MISSION_13,
  14: MISSION_14,
  15: MISSION_15,
};

// ── Initial state ─────────────────────────────────────────────────
export function initialState(): TerminalState {
  return { xp: 0, completedMissions: [], currentMission: null, currentChallenge: 0, earnedBadges: [] };
}

// ── Main dispatcher ───────────────────────────────────────────────
export function parseCommand(raw: string, state: TerminalState): CommandOutput {
  const input    = raw.trim();
  const spaceIdx = input.indexOf(' ');
  const cmd      = (spaceIdx === -1 ? input : input.slice(0, spaceIdx)).toLowerCase();

  switch (cmd) {
    case 'help':     return cmdHelp(state);
    case 'missions': return cmdMissions(state);
    case 'status':   return cmdStatus(state);
    case 'badges':   return cmdBadges(state);
    case 'clear':    return { lines: [], newState: state, shouldClear: true };
    case 'start':    return cmdStart(Number(spaceIdx === -1 ? '' : input.slice(spaceIdx + 1).trim()), state);
    case 'hint':     return cmdHint(state);
    case 'next':     return cmdNext(state);
    case 'skip':     return cmdSkip(state);
    case 'reset':    return cmdReset();
    case '':         return { lines: [], newState: state };
    default:
      // Mission challenges accept real-workflow commands: claude, git, gh,
      // echo, cat, slash commands… Anything not a builtin is an attempt.
      if (state.currentMission !== null) return cmdAttempt(input, state);
      return {
        lines: [`  ${r('Unknown command:')} ${cmd} — type ${c('help')} to see all commands.`],
        newState: state,
      };
  }
}

// ── Command handlers ──────────────────────────────────────────────
function cmdHelp(state: TerminalState): CommandOutput {
  return {
    lines: [
      b('Commands'),
      '',
      `  ${c('missions')}           List all missions and your progress`,
      `  ${c('start <n>')}          Begin mission n   (e.g. ${c('start 1')})`,
      `  ${c('hint')}               Hint for the current challenge`,
      `  ${c('next')}               Advance to next challenge (re-shows prompt)`,
      `  ${c('skip')}               Skip challenge — no XP awarded`,
      `  ${c('status')}             Show XP, level, badges, and completion count`,
      `  ${c('badges')}             Show all badges and which you have earned`,
      `  ${c('reset')}              Reset all progress and start fresh`,
      `  ${c('clear')}              Clear terminal output`,
      `  ${c('help')}               This message`,
      '',
      `  Inside missions you type real workflow commands:`,
      `  ${c('claude "..."')}  ${c('claude -p "..."')}  ${c('/clear')}  ${c('/context')}`,
      `  ${c('echo "..." >> AGENTS.md')}  ${c('gh issue create ...')}  ${c('git ...')}`,
    ],
    newState: state,
  };
}

function cmdMissions(state: TerminalState): CommandOutput {
  const trackLabel: Record<number, string> = {
    1: 'Fundamentals & Steering',
    2: 'Plan & Decompose',
    3: 'Feedback Loops & AFK Agents',
  };
  const lines: string[] = [b('Missions — The Engineer’s Path'), ''];
  let lastTrack = 0;

  for (const m of MISSIONS) {
    if (m.track !== lastTrack) {
      lastTrack = m.track;
      lines.push(d(`  ── Track ${m.track}: ${trackLabel[m.track]} ──`));
    }
    const done = state.completedMissions.includes(m.id);
    const icon = done ? g('✅') : y('🔓');
    const num  = String(m.id).padStart(2, '0');
    const xpLabel = done ? d(`+${m.xp} XP ✓`) : `+${m.xp} XP`;
    lines.push(`  ${icon} ${num}. ${m.title.padEnd(30)} ${xpLabel}`);
  }

  lines.push('');
  lines.push(`  Type ${c('start <n>')} to begin any mission.`);
  return { lines, newState: state };
}

function cmdStatus(state: TerminalState): CommandOutput {
  const { level, name, nextThreshold } = getLevel(state.xp);
  const toNext = nextThreshold === Infinity ? '—' : String(nextThreshold - state.xp);
  return {
    lines: [
      b('Status'),
      '',
      `  XP:      ${y(String(state.xp))}`,
      `  Level:   ${level} — ${y(name)}`,
      `  To next: ${toNext === '—' ? d('Max level reached!') : `${toNext} XP`}`,
      `  Done:    ${state.completedMissions.length} / ${MISSION_COUNT} missions`,
      `  Badges:  ${state.earnedBadges.length} / ${BADGES.length} — type ${c('badges')} to view`,
    ],
    newState: state,
  };
}

function cmdBadges(state: TerminalState): CommandOutput {
  const lines: string[] = [b('Badges'), ''];
  for (const badge of BADGES) {
    const earned = state.earnedBadges.includes(badge.id);
    const icon   = earned ? y('🏆') : d('🔒');
    lines.push(`  ${icon} ${badge.name.padEnd(22)} ${d(badge.description)}`);
  }
  lines.push('');
  lines.push(`  ${state.earnedBadges.length} / ${BADGES.length} earned`);
  return { lines, newState: state };
}

function cmdReset(): CommandOutput {
  return {
    lines: [
      g('✅ Progress reset.'),
      `  Type ${c('start 1')} to begin fresh, or ${c('missions')} to see all ${MISSION_COUNT} missions.`,
    ],
    newState: initialState(),
  };
}

function cmdStart(n: number, state: TerminalState): CommandOutput {
  if (!Number.isInteger(n) || n < 1 || n > MISSION_COUNT) {
    return { lines: [`  ${r('Usage:')} start <1–${MISSION_COUNT}>`], newState: state };
  }
  const mission = MISSIONS.find(m => m.id === n);
  if (!mission) return { lines: [`  ${r('Mission not found.')}`], newState: state };

  if (state.completedMissions.includes(n)) {
    return {
      lines: [
        `  ${g(`✅ Mission ${n} already completed!`)}`,
        `  Type ${c('missions')} to see progress, or ${c('start <n>')} for another mission.`,
      ],
      newState: state,
    };
  }

  const challenges = MISSION_CHALLENGES[n];
  if (!challenges) {
    return {
      lines: [`  ${d('Mission content coming soon — try another mission!')}`],
      newState: state,
    };
  }
  const newState: TerminalState = { ...state, currentMission: n, currentChallenge: 0 };
  return {
    lines: [
      '',
      b(`Mission ${String(n).padStart(2, '0')}: ${mission.title}`),
      d('─'.repeat(50)),
      ...challenges[0].prompt,
    ],
    newState,
  };
}

function cmdHint(state: TerminalState): CommandOutput {
  if (state.currentMission === null) {
    return {
      lines: [`  ${d('No active mission — type')} ${c('missions')} ${d('to get started.')}`],
      newState: state,
    };
  }
  const challenges = MISSION_CHALLENGES[state.currentMission];
  if (!challenges) return { lines: [`  ${d('No hint available.')}`], newState: state };
  const ch = challenges[state.currentChallenge];
  return { lines: [`  💡 ${y('Hint:')} ${ch.hint}`], newState: state };
}

function cmdNext(state: TerminalState): CommandOutput {
  if (state.currentMission === null) {
    return { lines: [`  ${d('No active mission.')}`], newState: state };
  }
  const challenges = MISSION_CHALLENGES[state.currentMission];
  if (!challenges) return { lines: [], newState: state };

  const nextIdx = state.currentChallenge + 1;
  if (nextIdx >= challenges.length) {
    return {
      lines: [
        `  ${d("You're on the last challenge — complete it to finish the mission!")}`,
      ],
      newState: state,
    };
  }
  return {
    lines: ['', ...challenges[nextIdx].prompt],
    newState: { ...state, currentChallenge: nextIdx },
  };
}

function cmdSkip(state: TerminalState): CommandOutput {
  if (state.currentMission === null) {
    return { lines: [`  ${d('No active mission.')}`], newState: state };
  }
  const challenges = MISSION_CHALLENGES[state.currentMission];
  if (!challenges) return { lines: [], newState: state };

  const nextIdx = state.currentChallenge + 1;
  if (nextIdx >= challenges.length) {
    const completedMissions = [...state.completedMissions, state.currentMission];
    const intermediate: TerminalState = { ...state, completedMissions, currentMission: null, currentChallenge: 0 };
    const { state: newState, newBadges } = awardBadges(intermediate);
    return {
      lines: [
        `  ${d('Skipped — mission marked complete (no XP for this challenge).')}`,
        ...announceBadges(newBadges),
        `  Type ${c('missions')} to continue.`,
      ],
      newState,
    };
  }
  return {
    lines: [`  ${d('Skipped — no XP.')}`, '', ...challenges[nextIdx].prompt],
    newState: { ...state, currentChallenge: nextIdx },
  };
}

function cmdAttempt(input: string, state: TerminalState): CommandOutput {
  const challenges = MISSION_CHALLENGES[state.currentMission!];
  if (!challenges) return { lines: [], newState: state };

  const ch = challenges[state.currentChallenge];
  if (!ch.validate(input)) {
    return {
      lines: [`  ${r('Not quite right.')} Type ${c('hint')} if you're stuck.`],
      newState: state,
    };
  }

  const newXp   = state.xp + ch.xp;
  const nextIdx = state.currentChallenge + 1;

  if (nextIdx >= challenges.length) {
    const mission           = MISSIONS.find(m => m.id === state.currentMission)!;
    const completedMissions = [...state.completedMissions, state.currentMission!];
    const intermediate: TerminalState = {
      ...state,
      xp: newXp,
      completedMissions,
      currentMission: null,
      currentChallenge: 0,
    };
    const { state: newState, newBadges } = awardBadges(intermediate);
    const { name: levelName } = getLevel(newXp);
    const nextMissionLine = mission.id < MISSION_COUNT
      ? `  Type ${c('missions')} to see progress, or ${c(`start ${mission.id + 1}`)} for the next mission.`
      : `  Type ${c('missions')} to review your progress. You've walked the Engineer's Path! 🎓`;
    return {
      lines: [
        ...ch.successLines,
        '',
        y(`+${ch.xp} XP`) + ` — Total: ${y(String(newXp) + ' XP')} (${levelName})`,
        '',
        g(`🎉 Mission ${String(mission.id).padStart(2, '0')} complete!`) + ` ${b(mission.title)}`,
        ...announceBadges(newBadges),
        '',
        nextMissionLine,
      ],
      newState,
    };
  }

  const { state: newState, newBadges } = awardBadges({ ...state, xp: newXp, currentChallenge: nextIdx });
  return {
    lines: [
      ...ch.successLines,
      '',
      y(`+${ch.xp} XP`) + ` — Total: ${y(String(newXp) + ' XP')}`,
      ...announceBadges(newBadges),
      '',
      ...challenges[nextIdx].prompt,
    ],
    newState,
  };
}
