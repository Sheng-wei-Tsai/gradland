import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AU Tech Salary Checker — Gradland',
  description: 'Is your job offer fair? Compare against ACS market data for Australian IT roles and get a negotiation script — free.',
};

export default function SalaryCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
