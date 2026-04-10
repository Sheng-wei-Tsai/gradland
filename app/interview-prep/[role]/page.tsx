import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoleById } from '@/lib/interview-roles';
import InterviewSession from './InterviewSession';

type Props = { params: Promise<{ role: string }> };

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://henrysdigitallife.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: roleId } = await params;
  const role = getRoleById(roleId);
  if (!role) return { title: 'Interview Prep' };
  const title = `${role.title} Interview Prep`;
  const description = `Practice the 10 most common ${role.title} interview questions with AI feedback. ${role.salaryRange} AUD.`;
  const url = `${BASE_URL}/interview-prep/${roleId}`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  };
}

export default async function InterviewRolePage({ params }: Props) {
  const { role: roleId } = await params;
  const role = getRoleById(roleId);
  if (!role) notFound();

  return <InterviewSession role={role} />;
}
