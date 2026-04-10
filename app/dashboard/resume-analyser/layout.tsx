import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Analyser — TechPath AU',
  description: 'Get an AI-powered score for your resume against the Australian IT job market. Fix ATS issues and beat 90% of applicants.',
};

export default function ResumeAnalyserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
