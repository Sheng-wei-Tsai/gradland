import { Metadata } from 'next';
import { createSupabaseServer } from '@/lib/auth-server';
import NetworkPageClient from './NetworkPageClient';

export const metadata: Metadata = {
  title: 'Job Seeker Network — TechPath AU',
  description:
    'Browse anonymous profiles of international IT job seekers in Australia. Connect with others in your city searching for the same roles.',
};

export const revalidate = 60;

export default async function NetworkPage() {
  const sb = await createSupabaseServer();

  const [{ data: { user } }, { data: profiles }] = await Promise.all([
    sb.auth.getUser(),
    sb
      .from('anonymous_profiles')
      .select('id, role_title, visa_type, skills, city, created_at')
      .order('updated_at', { ascending: false })
      .limit(200),
  ]);

  let hasProfile = false;
  if (user) {
    const { data } = await sb
      .from('anonymous_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    hasProfile = !!data;
  }

  return (
    <NetworkPageClient
      initialProfiles={profiles ?? []}
      isLoggedIn={!!user}
      hasProfile={hasProfile}
    />
  );
}
