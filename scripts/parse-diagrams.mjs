// One-shot helper: parse every content/diagrams/*.md through mermaid and
// list the ones whose syntax doesn't compile. Used to identify why the
// /learn/diagrams page renders some entries as "Could not render".
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMPurify = (await import('isomorphic-dompurify')).default;

const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });

const dir = path.resolve(process.cwd(), 'content/diagrams');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

let bad = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const { data } = matter(raw);
  const code = String(data.mermaid ?? '').trim();
  if (!code) { console.log(`EMPTY  ${f}`); bad++; continue; }
  try {
    await mermaid.parse(code);
  } catch (err) {
    bad++;
    const msg = String(err.message ?? err).split('\n').slice(0, 3).join(' | ').slice(0, 240);
    console.log(`FAIL   ${f}  →  ${msg}`);
  }
}
console.log(`\n${files.length} checked, ${bad} fail`);
