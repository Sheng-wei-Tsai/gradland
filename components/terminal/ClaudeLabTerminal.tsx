'use client';

import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { parseCommand, initialState } from './commandParser';
import type { TerminalState } from './commandParser';

const PROMPT = '\x1b[36mclaud-lab\x1b[0m \x1b[90m$\x1b[0m ';

const WELCOME: string[] = [
  '',
  '  \x1b[1m\x1b[33mClaude Lab\x1b[0m — Interactive AI Learning Terminal',
  '  Master Claude, Claude Code, and AI workflows through 15 missions.',
  '',
  `  \x1b[36mmissions\x1b[0m  \x1b[2m→ see all 15 learning missions\x1b[0m`,
  `  \x1b[36mstart 1\x1b[0m   \x1b[2m→ jump into Mission 01: Anatomy of a Prompt\x1b[0m`,
  `  \x1b[36mhelp\x1b[0m      \x1b[2m→ list all commands\x1b[0m`,
  '',
];

function writeLine(term: Terminal, text: string): void {
  term.write('\r\n' + text);
}

function writePrompt(term: Terminal): void {
  term.write('\r\n' + PROMPT);
}

export default function ClaudeLabTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let term: Terminal | null = null;
    let ro: ResizeObserver | null = null;
    let fitAddon: FitAddon | null = null;

    // Mutable state held in refs — changes don't need re-renders
    let state: TerminalState = initialState();
    let inputBuf = '';
    const history: string[] = [];
    let histIdx = -1;

    Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
    ]).then(([{ Terminal }, { FitAddon }]) => {
      if (disposed || !containerRef.current) return;

      term = new Terminal({
        theme: {
          background:          '#07050f',
          foreground:          '#f0e6d0',
          cursor:              '#e84040',
          cursorAccent:        '#07050f',
          selectionBackground: '#1a1430',
          black:   '#07050f',   red:     '#e84040',
          green:   '#3ec880',   yellow:  '#f0b830',
          blue:    '#7ab0c8',   magenta: '#c8b090',
          cyan:    '#86b4c8',   white:   '#f0e6d0',
          brightBlack:   '#1a1430',   brightRed:     '#ff5252',
          brightGreen:   '#5fe090',   brightYellow:  '#ffd040',
          brightBlue:    '#a0c8e0',   brightMagenta: '#e0c0a0',
          brightCyan:    '#a0d0e0',   brightWhite:   '#ffffff',
        },
        fontSize:    13,
        fontFamily:  '"JetBrains Mono", "Fira Code", "Courier New", monospace',
        cursorBlink: true,
        scrollback:  1000,
        convertEol:  false,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      for (const line of WELCOME) writeLine(term, line);
      writePrompt(term);
      term.focus();

      ro = new ResizeObserver(() => {
        try { fitAddon?.fit(); } catch { /* ignore during unmount */ }
      });
      ro.observe(containerRef.current);

      term.onData((data: string) => {
        if (!term) return;

        // Enter
        if (data === '\r') {
          const cmd = inputBuf;
          inputBuf = '';
          histIdx  = -1;
          if (cmd.trim()) history.unshift(cmd);

          term.write('\r\n');
          const result = parseCommand(cmd, state);
          state = result.newState;

          if (result.shouldClear) {
            term.clear();
          } else {
            for (const line of result.lines) writeLine(term, line);
          }
          writePrompt(term);
          return;
        }

        // Backspace
        if (data === '\x7f') {
          if (inputBuf.length > 0) {
            inputBuf = inputBuf.slice(0, -1);
            term.write('\b \b');
          }
          return;
        }

        // Ctrl+C — cancel line
        if (data === '\x03') {
          inputBuf = '';
          histIdx  = -1;
          term.write('^C');
          writePrompt(term);
          return;
        }

        // Escape sequences (arrow keys)
        if (data.startsWith('\x1b[')) {
          if (data === '\x1b[A') {
            // Up — history back
            if (history.length === 0) return;
            histIdx = Math.min(histIdx + 1, history.length - 1);
            inputBuf = history[histIdx];
            term.write('\x1b[2K\r' + PROMPT + inputBuf);
          } else if (data === '\x1b[B') {
            // Down — history forward
            if (histIdx <= 0) {
              histIdx  = -1;
              inputBuf = '';
              term.write('\x1b[2K\r' + PROMPT);
            } else {
              histIdx--;
              inputBuf = history[histIdx];
              term.write('\x1b[2K\r' + PROMPT + inputBuf);
            }
          }
          return;
        }

        // Printable characters only
        if (data >= ' ') {
          inputBuf += data;
          term.write(data);
        }
      });
    });

    return () => {
      disposed = true;
      ro?.disconnect();
      term?.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
