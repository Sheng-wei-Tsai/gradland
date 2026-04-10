import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — TechPath AU',
  description: 'Your personalised Australian IT career dashboard — readiness score, job tracker, skill progress and onboarding checklist.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
