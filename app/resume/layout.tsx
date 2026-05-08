import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Builder — Gradland',
  description: 'Build an ATS-ready resume tailored to Australian IT roles. Download as PDF and get it past the bots.',
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
