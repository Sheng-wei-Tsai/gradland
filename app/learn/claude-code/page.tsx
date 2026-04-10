import type { Metadata } from 'next';
import ClaudeCodeGuide from './ClaudeCodeGuide';

export const metadata: Metadata = {
  title: 'Master Claude Code — Step-by-Step Guide',
  description: 'From zero to expert: 20 interactive lessons covering Claude Code installation, workflows, custom skills, hooks, MCP, agents and more.',
};

export default function ClaudeCodePage() {
  return <ClaudeCodeGuide />;
}
