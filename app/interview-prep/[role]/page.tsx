import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoleById } from '@/lib/interview-roles';
import InterviewSession from './InterviewSession';

type Props = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: roleId } = await params;
  const role = getRoleById(roleId);
  if (!role) return { title: 'Interview Prep' };
  return {
    title: `${role.title} Interview Prep`,
    description: `Practice the 10 most common ${role.title} interview questions with AI feedback. ${role.salaryRange} AUD.`,
  };
}

export default async function InterviewRolePage({ params }: Props) {
  const { role: roleId } = await params;
  const role = getRoleById(roleId);
  if (!role) notFound();

  return <InterviewSession role={role} />;
}
