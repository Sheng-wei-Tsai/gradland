import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Australian IT Career Insights — Gradland',
  description: 'Company tiers, salary benchmarks, visa sponsors, grad programs, skill map and career guide — everything you need to land an IT job in Australia.',
};

export default function AUInsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
