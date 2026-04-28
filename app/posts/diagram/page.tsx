import { Metadata } from 'next';
import { STARTER_DIAGRAMS } from '@/data/starter-diagrams';
import DiagramPageClient from './DiagramPageClient';

export const metadata: Metadata = {
  title: 'Diagrams — Learn IT, AI, and Fullstack Concepts Visually | TechPath AU',
  description:
    'Editorial-quality technical diagrams: how the Internet works, how an LLM generates text, the SDLC with CI/CD, and modern web architecture. Generate your own from any topic.',
};

export default function DiagramPage() {
  return <DiagramPageClient diagrams={STARTER_DIAGRAMS} />;
}
