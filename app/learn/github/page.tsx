import type { Metadata } from 'next';
import GitHubSkillsGuide from './GitHubSkillsGuide';

export const metadata: Metadata = {
  title: 'GitHub Skills Learning Guide — 37 Official Courses',
  description:
    'All 37 official GitHub Skills courses organised into 6 progressive levels — Foundation to Advanced DevOps. Track your progress across Git, Actions, Copilot, Security, and more.',
  openGraph: {
    title: 'GitHub Skills Learning Guide',
    description: '37 official GitHub courses from beginner Git to Copilot, Actions & DevSecOps.',
  },
};

export default function GitHubSkillsPage() {
  return <GitHubSkillsGuide />;
}
