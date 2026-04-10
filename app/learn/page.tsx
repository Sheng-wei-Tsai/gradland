import { Metadata } from 'next';
import { SKILL_PATHS } from '@/lib/skill-paths';
import LearnPageClient from './LearnPageClient';

export const metadata: Metadata = {
  title: 'IT Learning Paths — TechPath AU',
  description: 'Structured learning paths for Frontend, Backend, Data Engineer and DevOps roles in Australia. Spaced repetition keeps your skills sharp.',
};

export default function LearnPage() {
  return <LearnPageClient paths={SKILL_PATHS} />;
}
