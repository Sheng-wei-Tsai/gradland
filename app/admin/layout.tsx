/**
 * Admin layout — server component.
 * Middleware already blocks non-owners before this renders,
 * so this is a defence-in-depth second check.
 * No flash, no client-side race condition.
 */
import { redirect } from 'next/navigation';
import { getServerUser, isOwner } from '@/lib/auth-server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user || !isOwner(user.email)) {
    redirect('/');
  }

  return <>{children}</>;
}
