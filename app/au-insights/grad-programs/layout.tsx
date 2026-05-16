import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Australian IT Graduate Programs — Gradland',
  description: 'Track open/closed status for every major Australian tech graduate program — Atlassian, ANZ, CBA, Canva and more — with closing dates and eligibility.',
};

export default function GradProgramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
