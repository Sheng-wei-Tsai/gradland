'use client';
import { useEffect, useRef, useState } from 'react';
import type { TerminalScenario } from '@/lib/posts';

interface Props {
  scenario: TerminalScenario;
  /** Fires when user enters a passing input. */
  onPass:   () => void;
  /** Whether the user has already passed this scenario (locks input). */
  passed:   boolean;
}

interface LogLine {
  kind: 'prompt' | 'input' | 'output' | 'error' | 'hint';
  text: string;
}

function matches(input: string, scenario: TerminalScenario): boolean {
  const trimmed = input.trim();
  if (scenario.match === 'exact') {
    return trimmed.toLowerCase() === scenario.expectedInput.trim().toLowerCase();
  }
  try {
    return new RegExp(scenario.expectedInput, 'i').test(trimmed);
  } catch {
    return false;
  }
}

export default function TerminalSim({ scenario, onPass, passed }: Props) {
  const [lines, setLines] = useState<LogLine[]>([
    { kind: 'prompt', text: scenario.prompt },
  ]);
  const [input,    setInput]    = useState('');
  const [attempts, setAttempts] = useState(0);
  const [done,     setDone]     = useState(passed);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (passed && !done) {
      setDone(true);
      setLines(prev => [...prev, {
        kind: 'output',
        text: scenario.successOutput,
      }]);
    }
  }, [passed, done, scenario.successOutput]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (done || !input.trim()) return;

    const userInput = input;
    setInput('');
    const newLines: LogLine[] = [{ kind: 'input', text: userInput }];

    if (matches(userInput, scenario)) {
      newLines.push({ kind: 'output', text: scenario.successOutput });
      setLines(prev => [...prev, ...newLines]);
      setDone(true);
      onPass();
      return;
    }

    setAttempts(a => a + 1);
    newLines.push({ kind: 'error', text: `command not recognised: ${userInput}` });
    if (attempts >= 1 && scenario.hint) {
      newLines.push({ kind: 'hint', text: `💡 Hint: ${scenario.hint}` });
    }
    setLines(prev => [...prev, ...newLines]);
  };

  return (
    <div style={{
      background: '#0d1117',
      borderRadius: '10px',
      border: '1px solid var(--parchment)',
      boxShadow: 'var(--panel-shadow)',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', 'Menlo', monospace",
      fontSize: '0.85rem',
      margin: '1.5rem 0',
    }}>
      <div style={{
        background: '#161b22',
        padding: '0.5rem 0.9rem',
        borderBottom: '1px solid #30363d',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
        <span style={{ marginLeft: '0.6rem', color: '#8b949e', fontSize: '0.72rem' }}>
          claude-code · try it
        </span>
        {done && (
          <span style={{
            marginLeft: 'auto',
            color: '#3fb950', fontSize: '0.72rem', fontWeight: 600,
          }}>
            ✓ passed
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        style={{
          padding: '1rem 1.1rem',
          minHeight: '180px',
          maxHeight: '320px',
          overflowY: 'auto',
          color: '#c9d1d9',
          lineHeight: 1.6,
        }}
      >
        {lines.map((l, i) => {
          if (l.kind === 'prompt') {
            return (
              <div key={i} style={{ color: '#8b949e', marginBottom: '0.8rem', whiteSpace: 'pre-wrap' }}>
                # {l.text}
              </div>
            );
          }
          if (l.kind === 'input') {
            return (
              <div key={i} style={{ color: '#c9d1d9' }}>
                <span style={{ color: '#3fb950' }}>$ </span>{l.text}
              </div>
            );
          }
          if (l.kind === 'output') {
            return (
              <div key={i} style={{ color: '#79c0ff', whiteSpace: 'pre-wrap', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                {l.text}
              </div>
            );
          }
          if (l.kind === 'error') {
            return (
              <div key={i} style={{ color: '#f85149' }}>
                ✗ {l.text}
              </div>
            );
          }
          return (
            <div key={i} style={{ color: '#d29922' }}>{l.text}</div>
          );
        })}

        {!done && (
          <form onSubmit={submit} style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
            <span style={{ color: '#3fb950' }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: '#c9d1d9', fontFamily: 'inherit', fontSize: 'inherit',
              }}
              aria-label="terminal input"
            />
          </form>
        )}
      </div>
    </div>
  );
}
