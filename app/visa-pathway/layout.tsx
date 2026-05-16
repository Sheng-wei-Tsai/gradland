import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visa Pathway to PR — Gradland',
  description: 'Find your fastest route to Australian permanent residency. Score the 189/190/491 points test and check 482/186 employer pathway eligibility in 60 seconds.',
};

export default function VisaPathwayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
