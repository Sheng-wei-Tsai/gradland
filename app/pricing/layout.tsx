import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — TechPath AU',
  description: 'Simple, transparent pricing. Free tools to get started. Upgrade to Pro for unlimited AI resume feedback, interview coaching, and cover letter generation — $9.99/month.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
