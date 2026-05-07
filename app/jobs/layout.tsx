import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IT Jobs in Australia — Gradland',
  description: 'Browse thousands of Australian IT roles filtered by working rights, visa sponsorship, location and tech stack.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
