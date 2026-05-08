import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMPANIES } from '@/app/au-insights/companies/data';
import { ResearchClient } from './ResearchClient';

export function generateStaticParams() {
  return COMPANIES.map(c => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const company = COMPANIES.find(c => c.slug === slug);
  if (!company) return {};
  return {
    title: `${company.name} AI Research Brief — Gradland`,
    description: `AI-generated career research brief for ${company.name}: culture, tech stack, interview style, and tips for international graduates in Australia.`,
  };
}

export default async function CompanyResearchPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const company = COMPANIES.find(c => c.slug === slug);
  if (!company) notFound();

  return <ResearchClient company={company} />;
}
