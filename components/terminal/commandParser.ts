// Terminal state machine for Claude Lab. Pure functions — no side effects.

export interface TerminalState {
  xp: number;
  completedMissions: number[];
  currentMission: number | null;
  currentChallenge: number;
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

// ── Level system ──────────────────────────────────────────────────
const LEVELS = [
  { threshold: 0,    name: 'Curious' },
  { threshold: 100,  name: 'Builder' },
  { threshold: 300,  name: 'Practitioner' },
  { threshold: 600,  name: 'Engineer' },
  { threshold: 1000, name: 'Expert' },
  { threshold: 1500, name: 'Claude Whisperer' },
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

// ── Mission catalogue ─────────────────────────────────────────────
interface Mission {
  id: number;
  title: string;
  xp: number;
  track: number;
  available: boolean;
}

const MISSIONS: Mission[] = [
  { id: 1,  title: 'Anatomy of a Prompt',      xp: 25, track: 1, available: true  },
  { id: 2,  title: 'System Prompt Design',      xp: 25, track: 1, available: false },
  { id: 3,  title: 'Chain-of-Thought',          xp: 30, track: 1, available: false },
  { id: 4,  title: 'Handling Edge Cases',       xp: 30, track: 1, available: false },
  { id: 5,  title: 'Prompt Injection Defence',  xp: 40, track: 1, available: false },
  { id: 6,  title: 'First Claude Code Session', xp: 25, track: 2, available: false },
  { id: 7,  title: 'Slash Commands',            xp: 25, track: 2, available: false },
  { id: 8,  title: 'Hooks & Automation',        xp: 40, track: 2, available: false },
  { id: 9,  title: 'MCP Servers',               xp: 40, track: 2, available: false },
  { id: 10, title: 'Multi-Agent Patterns',      xp: 50, track: 2, available: false },
  { id: 11, title: 'RAG Pipeline',              xp: 30, track: 3, available: false },
  { id: 12, title: 'Tool Use Design',           xp: 40, track: 3, available: false },
  { id: 13, title: 'Evaluation Strategy',       xp: 40, track: 3, available: false },
  { id: 14, title: 'Cost Optimisation',         xp: 30, track: 3, available: false },
  { id: 15, title: 'Production Guardrails',     xp: 50, track: 3, available: false },
];

// ── Challenge type ────────────────────────────────────────────────
interface Challenge {
  prompt: string[];
  hint: string;
  validate: (input: string) => boolean;
  successLines: string[];
  xp: number;
}

// ── Mission 01: Anatomy of a Prompt ──────────────────────────────
const MISSION_01: Challenge[] = [
  {
    prompt: [
      b('Challenge 1/2') + ' — Basic message',
      '',
      '  Every Claude conversation starts with a user message.',
      `  Try: ${c('claude --message "Tell me one fact about Australia"')}`,
    ],
    hint: `Send a message flag: ${c('claude --message "Tell me one fact about Australia"')}`,
    validate: (input) => /claude\s+--message\s+["'].+["']/.test(input),
    successLines: [
      g('✅ Correct!') + ' Claude responds to your message.',
      d('  Claude: Australia is the only continent occupied by a single nation.'),
      '',
      `  Type ${c('next')} to continue, or ${c('hint')} if you get stuck.`,
    ],
    xp: 12,
  },
  {
    prompt: [
      b('Challenge 2/2') + ' — System prompt + message',
      '',
      '  A system prompt tells Claude how to behave throughout the whole conversation.',
      `  Try: ${c('claude --system "You are a friendly pirate" --message "Hello"')}`,
    ],
    hint: `Include both flags: ${c('claude --system "..." --message "..."')}`,
    validate: (input) => /claude\s+--system\s+["'].+["']\s+--message\s+["'].+["']/.test(input),
    successLines: [
      g('✅ Correct!') + " The system prompt shapes Claude's entire persona.",
      d('  Claude: Ahoy there, matey! What can I help ye with on this fine day?'),
    ],
    xp: 13,
  },
];

const MISSION_CHALLENGES: Record<number, Challenge[]> = { 1: MISSION_01 };

// ── Initial state ─────────────────────────────────────────────────
export function initialState(): TerminalState {
  return { xp: 0, completedMissions: [], currentMission: null, currentChallenge: 0 };
}

// ── Main dispatcher ───────────────────────────────────────────────
export function parseCommand(raw: string, state: TerminalState): CommandOutput {
  const input      = raw.trim();
  const spaceIdx   = input.indexOf(' ');
  const cmd        = (spaceIdx === -1 ? input : input.slice(0, spaceIdx)).toLowerCase();
  const rest       = spaceIdx === -1 ? '' : input.slice(spaceIdx + 1).trim();

  switch (cmd) {
    case 'help':     return cmdHelp(state);
    case 'missions': return cmdMissions(state);
    case 'status':   return cmdStatus(state);
    case 'clear':    return { lines: [], newState: state, shouldClear: true };
    case 'start':    return cmdStart(Number(rest), state);
    case 'hint':     return cmdHint(state);
    case 'next':     return cmdNext(state);
    case 'skip':     return cmdSkip(state);
    case 'claude':   return cmdClaude(input, state);
    case '':         return { lines: [], newState: state };
    default:
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
      `  ${c('hint')}               Hint for current challenge`,
      `  ${c('next')}               Advance to next challenge`,
      `  ${c('skip')}               Skip challenge — no XP`,
      `  ${c('status')}             XP, level, progress`,
      `  ${c('clear')}              Clear terminal`,
      `  ${c('help')}               This message`,
      '',
      `  ${c('claude --system "..." --message "..."')}`,
      `                  Simulate a Claude API call (used in missions)`,
    ],
    newState: state,
  };
}

function cmdMissions(state: TerminalState): CommandOutput {
  const trackLabel: Record<number, string> = {
    1: 'Prompt Engineering',
    2: 'Claude Code',
    3: 'AI Workflows',
  };
  const lines: string[] = [b('Missions'), ''];
  let lastTrack = 0;

  for (const m of MISSIONS) {
    if (m.track !== lastTrack) {
      lastTrack = m.track;
      lines.push(d(`  ── Track ${m.track}: ${trackLabel[m.track]} ──`));
    }
    const done = state.completedMissions.includes(m.id);
    const icon = done ? g('✅') : m.available ? y('🔓') : d('🔒');
    const num  = String(m.id).padStart(2, '0');
    const xpLabel = done ? d(`+${m.xp} XP ✓`) : `+${m.xp} XP`;
    lines.push(`  ${icon} ${num}. ${m.title.padEnd(30)} ${xpLabel}`);
  }

  lines.push('');
  lines.push(`  Type ${c('start 1')} to begin.`);
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
      `  Done:    ${state.completedMissions.length} / 15 missions`,
    ],
    newState: state,
  };
}

function cmdStart(n: number, state: TerminalState): CommandOutput {
  if (!Number.isInteger(n) || n < 1 || n > 15) {
    return { lines: [`  ${r('Usage:')} start <1–15>`], newState: state };
  }
  const mission = MISSIONS.find(m => m.id === n);
  if (!mission) return { lines: [`  ${r('Mission not found.')}`], newState: state };

  if (!mission.available) {
    return {
      lines: [
        `  ${y(`🔒 Mission ${n}`)} is not yet available.`,
        `  ${d('More missions coming soon — start with mission 1!')}`,
      ],
      newState: state,
    };
  }
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
        `  ${d('You\'re on the last challenge — complete it to finish the mission!')}`,
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
    return {
      lines: [
        `  ${d('Skipped — mission marked complete (no XP for this challenge).')}`,
        `  Type ${c('missions')} to continue.`,
      ],
      newState: { ...state, completedMissions, currentMission: null, currentChallenge: 0 },
    };
  }
  return {
    lines: [`  ${d('Skipped — no XP.')}`, '', ...challenges[nextIdx].prompt],
    newState: { ...state, currentChallenge: nextIdx },
  };
}

function cmdClaude(input: string, state: TerminalState): CommandOutput {
  if (state.currentMission === null) {
    return {
      lines: [
        `  ${d('claude commands are used inside missions.')}`,
        `  Type ${c('start 1')} to begin!`,
      ],
      newState: state,
    };
  }
  const challenges = MISSION_CHALLENGES[state.currentMission];
  if (!challenges) return { lines: [], newState: state };

  const ch = challenges[state.currentChallenge];
  if (!ch.validate(input)) {
    return {
      lines: [`  ${r('Not quite right.')} Type ${c('hint')} if you\'re stuck.`],
      newState: state,
    };
  }

  const newXp    = state.xp + ch.xp;
  const nextIdx  = state.currentChallenge + 1;

  if (nextIdx >= challenges.length) {
    const mission           = MISSIONS.find(m => m.id === state.currentMission)!;
    const completedMissions = [...state.completedMissions, state.currentMission];
    const newState: TerminalState = {
      ...state,
      xp: newXp,
      completedMissions,
      currentMission: null,
      currentChallenge: 0,
    };
    const { name: levelName } = getLevel(newXp);
    return {
      lines: [
        ...ch.successLines,
        '',
        y(`+${ch.xp} XP`) + ` — Total: ${y(String(newXp) + ' XP')} (${levelName})`,
        '',
        g(`🎉 Mission ${String(mission.id).padStart(2, '0')} complete!`) + ` ${b(mission.title)}`,
        '',
        `  Type ${c('missions')} to see progress, or ${c('start 2')} for the next mission.`,
      ],
      newState,
    };
  }

  return {
    lines: [
      ...ch.successLines,
      '',
      y(`+${ch.xp} XP`) + ` — Total: ${y(String(newXp) + ' XP')}`,
      '',
      ...challenges[nextIdx].prompt,
    ],
    newState: { ...state, xp: newXp, currentChallenge: nextIdx },
  };
}
