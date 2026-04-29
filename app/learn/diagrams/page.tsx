import type { Metadata } from 'next';
import { getAllDiagrams } from '@/lib/diagrams';
import { STARTER_DIAGRAMS } from '@/data/starter-diagrams';
import DiagramsPageClient from './DiagramsPageClient';

export const metadata: Metadata = {
  title: 'Visual System Design — Learn with Diagrams | TechPath AU',
  description: 'Daily diagrams explaining software engineering concepts — CDN, OAuth, databases, microservices and more. ByteByteGo-style visual learning.',
};

export default function DiagramsPage() {
  const daily   = getAllDiagrams();
  const starter = STARTER_DIAGRAMS;
  return <DiagramsPageClient dailyDiagrams={daily} starterDiagrams={starter} />;
}
