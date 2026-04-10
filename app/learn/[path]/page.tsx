import { notFound } from 'next/navigation';
import { getPathById, SKILL_PATHS } from '@/lib/skill-paths';
import PathTracker from './PathTracker';

export function generateStaticParams() {
  return SKILL_PATHS.map(p => ({ path: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const skillPath = getPathById(path);
  if (!skillPath) return { title: 'Learning Path' };
  return {
    title: skillPath.title,
    description: skillPath.description,
  };
}

export default async function LearnPathPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const skillPath = getPathById(path);
  if (!skillPath) notFound();
  return <PathTracker path={skillPath} />;
}
