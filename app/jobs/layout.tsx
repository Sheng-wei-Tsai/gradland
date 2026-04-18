import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IT Jobs in Australia — Indeed, LinkedIn, Seek, Jora + Remote & Freelance — TechPath AU',
  description: 'Browse thousands of Australian IT roles from Indeed, LinkedIn, Seek, Jora, ACS, and Adzuna — plus remote and freelance opportunities. Filtered by working rights, visa sponsorship, location and tech stack.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
