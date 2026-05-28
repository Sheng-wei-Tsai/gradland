/**
 * Server-side Mermaid syntax validator.
 *
 * The diagrams pipeline previously trusted "first token is flowchart" as a
 * proof of validity. That let through code the in-browser renderer can't
 * parse — so /learn/diagrams showed yellow "Could not render this diagram"
 * boxes for some entries.
 *
 * This module reuses the same Mermaid version the browser uses, shimming
 * the DOM via jsdom so `mermaid.parse()` works in Node. Call this from:
 *   - scripts/fetch-diagrams.ts before writing a generated diagram to disk
 *   - scripts/validate-content.ts as part of `npm run check`
 */

let parsePromise: Promise<(code: string) => Promise<void>> | null = null;

async function loadParser(): Promise<(code: string) => Promise<void>> {
  if (parsePromise) return parsePromise;

  parsePromise = (async () => {
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
    // Mermaid's runtime touches window, document, and DOMPurify; mount globals
    // before the module evaluates so its top-level side effects find them.
    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { DOMPurify: unknown }).DOMPurify = (await import('isomorphic-dompurify')).default;

    const mermaidMod = await import('mermaid');
    const mermaid = (mermaidMod as unknown as { default: { initialize: (o: unknown) => void; parse: (code: string) => Promise<unknown> } }).default;
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });

    return async (code: string) => {
      await mermaid.parse(code);
    };
  })();

  return parsePromise;
}

export interface MermaidValidation {
  ok: boolean;
  /** First-line summary of the parse error. */
  error?: string;
}

export async function validateMermaidSyntax(code: string): Promise<MermaidValidation> {
  if (typeof code !== 'string' || !code.trim()) {
    return { ok: false, error: 'empty mermaid code' };
  }
  // Catch the most common LLM mistake before invoking the parser: writing
  // "\n" (literal backslash-n) inside a node label instead of "<br/>".
  // The parser accepts it but the renderer displays the backslash, which
  // is the "syntax error in text" complaint visible on /learn/diagrams.
  if (/\[[^\]]*\\n[^\]]*\]/.test(code) || /\([^)]*\\n[^)]*\)/.test(code)) {
    return { ok: false, error: 'label contains literal \\n — use <br/> for line breaks' };
  }

  try {
    const parse = await loadParser();
    await parse(code);
    return { ok: true };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const summary = raw.split('\n').slice(0, 3).join(' | ').slice(0, 240);
    return { ok: false, error: summary };
  }
}
