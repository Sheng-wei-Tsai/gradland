import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — TechPath AU',
  description: 'Sign in or create a free account to access your personalised dashboard, resume analyser, AI interview prep, and visa tracker.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
