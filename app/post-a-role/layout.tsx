import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Role — Hire International IT Talent in Australia | TechPath AU',
  description: 'Reach thousands of qualified international IT graduates, 482 and 485 visa holders actively job-seeking in Australia. Post a role for $99 AUD per 30-day listing.',
};

export default function PostARoleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
